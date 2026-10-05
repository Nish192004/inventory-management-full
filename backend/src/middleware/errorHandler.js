export const notFound = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};

export const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err.code === "P2002") {
    return res.status(409).json({ message: "A record with this value already exists" });
  }

  if (err.code === "P2025") {
    return res.status(404).json({ message: "Record not found" });
  }

  res.status(err.statusCode || 500).json({
    message: err.message || "Internal server error"
  });
};
