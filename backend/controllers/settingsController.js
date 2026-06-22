const { getSystemSettings } = require("../services/systemSettingsService");

// @desc    Get public runtime settings
// @route   GET /api/settings/public
// @access  Public
const getPublicSettings = async (req, res) => {
  try {
    const settings = await getSystemSettings();
    res.json({
      success: true,
      data: {
        appTitle: settings.appTitle,
        maintenanceMode: settings.maintenanceMode,
        allowRegistration: settings.allowRegistration,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error loading public settings", error: error.message });
  }
};

module.exports = {
  getPublicSettings,
};
