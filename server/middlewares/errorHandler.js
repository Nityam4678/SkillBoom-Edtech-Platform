const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: "Resource not found",
  })
}

const errorHandler = (error, req, res, next) => {
  if (res.headersSent) return next(error)

  if (error.message === "Origin not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "Origin is not allowed",
    })
  }

  if (error.type === "entity.too.large" || error.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      success: false,
      message: "Request or file is too large",
    })
  }

  if (error.name === "MulterError" || error.code === "LIMIT_UNEXPECTED_FILE") {
    return res.status(400).json({
      success: false,
      message: "Invalid file upload",
    })
  }

  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON request body",
    })
  }

  if (error.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Invalid request data",
    })
  }

  if (error.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid resource identifier",
    })
  }

  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "Resource already exists",
    })
  }

  console.error("Unhandled request error", {
    method: req.method,
    path: req.path,
    error: error.message,
  })

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  })
}

module.exports = { notFoundHandler, errorHandler }