export const ApiResponse = {
  ok(res, data, message = 'OK', meta) {
    return res.status(200).json({ success: true, message, data, meta });
  },
  created(res, data, message = 'Created', meta) {
    return res.status(201).json({ success: true, message, data, meta });
  },
  noContent(res) {
    return res.status(204).end();
  },
};
