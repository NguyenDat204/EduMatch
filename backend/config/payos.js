let payosInstance = null;

/**
 * Lazily initializes and returns the PayOS client instance.
 * Since @payos/node is an ES Module, we load it dynamically to be compatible
 * with the existing CommonJS backend architecture without crashing the process.
 */
const getPayOSInstance = async () => {
  if (payosInstance) return payosInstance;

  if (!process.env.PAYOS_CLIENT_ID || !process.env.PAYOS_API_KEY || !process.env.PAYOS_CHECKSUM_KEY) {
    console.warn("WARNING: PayOS credentials (PAYOS_CLIENT_ID, PAYOS_API_KEY, PAYOS_CHECKSUM_KEY) are not fully configured in your .env file.");
  }

  // Dynamically import the ES module
  const { PayOS } = await import("@payos/node");
  
  payosInstance = new PayOS({
    clientId: process.env.PAYOS_CLIENT_ID || "",
    apiKey: process.env.PAYOS_API_KEY || "",
    checksumKey: process.env.PAYOS_CHECKSUM_KEY || "",
  });

  return payosInstance;
};

module.exports = {
  getPayOSInstance,
};
