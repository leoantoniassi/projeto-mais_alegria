function success(res, data, message = null, statusCode = 200) {
  const body = { success: true };
  if (data !== undefined) body.data = data;
  if (message) body.message = message;
  return res.status(statusCode).json(body);
}

function fail(res, message, statusCode = 400) {
  return res.status(statusCode).json({ success: false, message });
}

function warning(res, message) {
  return res.json({ success: false, warning: true, requiresConfirmation: true, message });
}

module.exports = { success, fail, warning };
