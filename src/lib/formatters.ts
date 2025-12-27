
/**
 * Formats the Order ID to be displayed in the UI.
 * Standardizes the "Short ID" format used across User and Admin panels.
 * Current format: Last 6 characters of the UUID/MongoID, Uppercased.
 * Example: 'a1b2c3d4...' -> 'C3D4...' (last 6)
 * 
 * @param id The full order ID
 * @returns The formatted short ID
 */
export const formatOrderId = (id: string): string => {
    if (!id) return 'N/A';
    // Ensure we are working with a string
    const strId = String(id);
    // Take last 6 chars
    return strId.slice(-6).toUpperCase();
};
