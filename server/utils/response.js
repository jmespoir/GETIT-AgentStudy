export const sendSuccess = (res, data, status = 200) =>
  res.status(status).json({ success: true, data, error: null });

export const sendError = (res, message, status = 500) =>
  res.status(status).json({ success: false, data: null, error: { message } });
