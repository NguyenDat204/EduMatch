const { GoogleAuth } = require("google-auth-library");

const GA4_SCOPE = "https://www.googleapis.com/auth/analytics.readonly";
const DATA_API_BASE_URL = "https://analyticsdata.googleapis.com/v1beta";

const PERIOD_START_DATES = {
  week: "7daysAgo",
  month: "30daysAgo",
  year: "365daysAgo",
  all: process.env.GA4_START_DATE || "2020-01-01",
};

let cachedAuthClient = null;

const normalizePrivateKey = (key) => key?.replace(/\\n/g, "\n");

const getCredentials = () => {
  if (process.env.GA4_SERVICE_ACCOUNT_JSON) {
    try {
      const parsed = JSON.parse(process.env.GA4_SERVICE_ACCOUNT_JSON);
      if (parsed.client_email && parsed.private_key) {
        return {
          client_email: parsed.client_email,
          private_key: normalizePrivateKey(parsed.private_key),
        };
      }
    } catch {
      return null;
    }
  }

  if (process.env.GA4_CLIENT_EMAIL && process.env.GA4_PRIVATE_KEY) {
    return {
      client_email: process.env.GA4_CLIENT_EMAIL,
      private_key: normalizePrivateKey(process.env.GA4_PRIVATE_KEY),
    };
  }

  return null;
};

const getAuthClient = async () => {
  if (cachedAuthClient) return cachedAuthClient;

  const credentials = getCredentials();
  if (!credentials) return null;

  const auth = new GoogleAuth({
    credentials,
    scopes: [GA4_SCOPE],
  });

  cachedAuthClient = await auth.getClient();
  return cachedAuthClient;
};

const getMetricValue = (row, metricHeaders, metricName) => {
  const index = metricHeaders.findIndex((header) => header.name === metricName);
  if (index === -1) return 0;
  const rawValue = row.metricValues?.[index]?.value;
  const numericValue = Number(rawValue);
  return Number.isFinite(numericValue) ? numericValue : 0;
};

const getDimensionValue = (row, dimensionHeaders, dimensionName) => {
  const index = dimensionHeaders.findIndex((header) => header.name === dimensionName);
  if (index === -1) return "";
  return row.dimensionValues?.[index]?.value || "";
};

const formatGaDate = (rawDate) => {
  if (!rawDate || rawDate.length !== 8) return rawDate || "";
  return `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`;
};

const formatGaLabel = (rawDate) => {
  if (!rawDate || rawDate.length !== 8) return rawDate || "--";
  return `${rawDate.slice(6, 8)}/${rawDate.slice(4, 6)}`;
};

const runGa4Report = async (authClient, propertyId, path, body) => {
  const response = await authClient.request({
    url: `${DATA_API_BASE_URL}/properties/${propertyId}:${path}`,
    method: "POST",
    data: body,
  });
  return response.data || {};
};

const getGa4Analytics = async (periodKey = "month") => {
  const propertyId = process.env.GA4_PROPERTY_ID?.trim();
  const authClient = await getAuthClient();

  if (!propertyId || !authClient) {
    return {
      configured: false,
      error: "GA4 chưa được cấu hình trên backend.",
      summary: null,
      realtime: { activeUsers: 0, pageViews: 0, events: 0, pages: [] },
      trends: [],
      topPages: [],
      topEvents: [],
    };
  }

  const startDate = PERIOD_START_DATES[periodKey] || PERIOD_START_DATES.month;
  const dateRanges = [{ startDate, endDate: "today" }];

  try {
    const [summary, trends, topPages, topEvents, realtime, realtimePages, realtimeEvents] = await Promise.all([
      runGa4Report(authClient, propertyId, "runReport", {
        dateRanges,
        metrics: [
          { name: "activeUsers" },
          { name: "newUsers" },
          { name: "sessions" },
          { name: "screenPageViews" },
          { name: "eventCount" },
          { name: "engagementRate" },
          { name: "averageSessionDuration" },
        ],
      }),
      runGa4Report(authClient, propertyId, "runReport", {
        dateRanges,
        dimensions: [{ name: "date" }],
        metrics: [
          { name: "activeUsers" },
          { name: "sessions" },
          { name: "screenPageViews" },
          { name: "eventCount" },
        ],
        orderBys: [{ dimension: { dimensionName: "date" } }],
      }),
      runGa4Report(authClient, propertyId, "runReport", {
        dateRanges,
        dimensions: [{ name: "pagePath" }, { name: "pageTitle" }],
        metrics: [
          { name: "screenPageViews" },
          { name: "activeUsers" },
          { name: "eventCount" },
        ],
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        limit: 8,
      }),
      runGa4Report(authClient, propertyId, "runReport", {
        dateRanges,
        dimensions: [{ name: "eventName" }],
        metrics: [{ name: "eventCount" }, { name: "activeUsers" }],
        orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
        limit: 8,
      }),
      runGa4Report(authClient, propertyId, "runRealtimeReport", {
        metrics: [
          { name: "activeUsers" },
          { name: "screenPageViews" },
          { name: "eventCount" },
        ],
      }),
      runGa4Report(authClient, propertyId, "runRealtimeReport", {
        dimensions: [{ name: "unifiedScreenName" }],
        metrics: [
          { name: "activeUsers" },
          { name: "screenPageViews" },
        ],
        orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
        limit: 10,
      }),
      runGa4Report(authClient, propertyId, "runRealtimeReport", {
        dimensions: [{ name: "eventName" }],
        metrics: [{ name: "eventCount" }],
        orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
        limit: 20,
      }),
    ]);

    const summaryRow = summary.rows?.[0] || {};
    const summaryHeaders = summary.metricHeaders || [];
    const realtimeRow = realtime.rows?.[0] || {};
    const realtimeHeaders = realtime.metricHeaders || [];
    const realtimePageRows = (realtimePages.rows || []).map((row) => ({
      path: getDimensionValue(row, realtimePages.dimensionHeaders || [], "unifiedScreenName") || "Không rõ",
      activeUsers: Math.round(getMetricValue(row, realtimePages.metricHeaders || [], "activeUsers")),
      pageViews: Math.round(getMetricValue(row, realtimePages.metricHeaders || [], "screenPageViews")),
    }));
    const realtimePageViews = realtimePageRows.reduce((sum, row) => sum + row.pageViews, 0);
    const realtimePageViewEvents = (realtimeEvents.rows || []).reduce((sum, row) => {
      const eventName = getDimensionValue(row, realtimeEvents.dimensionHeaders || [], "eventName");
      if (eventName !== "page_view") return sum;
      return sum + Math.round(getMetricValue(row, realtimeEvents.metricHeaders || [], "eventCount"));
    }, 0);

    return {
      configured: true,
      propertyId,
      summary: {
        activeUsers: Math.round(getMetricValue(summaryRow, summaryHeaders, "activeUsers")),
        newUsers: Math.round(getMetricValue(summaryRow, summaryHeaders, "newUsers")),
        sessions: Math.round(getMetricValue(summaryRow, summaryHeaders, "sessions")),
        pageViews: Math.round(getMetricValue(summaryRow, summaryHeaders, "screenPageViews")),
        events: Math.round(getMetricValue(summaryRow, summaryHeaders, "eventCount")),
        engagementRate: Number((getMetricValue(summaryRow, summaryHeaders, "engagementRate") * 100).toFixed(1)),
        averageSessionDuration: Math.round(getMetricValue(summaryRow, summaryHeaders, "averageSessionDuration")),
      },
      realtime: {
        activeUsers: Math.round(getMetricValue(realtimeRow, realtimeHeaders, "activeUsers")),
        pageViews: realtimePageViews || realtimePageViewEvents || Math.round(getMetricValue(realtimeRow, realtimeHeaders, "screenPageViews")),
        events: Math.round(getMetricValue(realtimeRow, realtimeHeaders, "eventCount")),
        pages: realtimePageRows,
      },
      trends: (trends.rows || []).map((row) => ({
        date: formatGaDate(getDimensionValue(row, trends.dimensionHeaders || [], "date")),
        label: formatGaLabel(getDimensionValue(row, trends.dimensionHeaders || [], "date")),
        activeUsers: Math.round(getMetricValue(row, trends.metricHeaders || [], "activeUsers")),
        sessions: Math.round(getMetricValue(row, trends.metricHeaders || [], "sessions")),
        pageViews: Math.round(getMetricValue(row, trends.metricHeaders || [], "screenPageViews")),
        events: Math.round(getMetricValue(row, trends.metricHeaders || [], "eventCount")),
      })),
      topPages: (topPages.rows || []).map((row) => ({
        path: getDimensionValue(row, topPages.dimensionHeaders || [], "pagePath") || "/",
        title: getDimensionValue(row, topPages.dimensionHeaders || [], "pageTitle") || "Không có tiêu đề",
        pageViews: Math.round(getMetricValue(row, topPages.metricHeaders || [], "screenPageViews")),
        activeUsers: Math.round(getMetricValue(row, topPages.metricHeaders || [], "activeUsers")),
        events: Math.round(getMetricValue(row, topPages.metricHeaders || [], "eventCount")),
      })),
      topEvents: (topEvents.rows || []).map((row) => ({
        name: getDimensionValue(row, topEvents.dimensionHeaders || [], "eventName") || "unknown",
        count: Math.round(getMetricValue(row, topEvents.metricHeaders || [], "eventCount")),
        activeUsers: Math.round(getMetricValue(row, topEvents.metricHeaders || [], "activeUsers")),
      })),
    };
  } catch (error) {
    return {
      configured: true,
      propertyId,
      error: error.response?.data?.error?.message || error.message,
      summary: null,
      realtime: { activeUsers: 0, pageViews: 0, events: 0, pages: [] },
      trends: [],
      topPages: [],
      topEvents: [],
    };
  }
};

module.exports = {
  getGa4Analytics,
};
