
// 1. MAVJUD BO'LMAGAN ROUTENI TEKSHIRISH
export const notFound = (req, res, next) => {
  // Xatolik yaratish
  const error = new Error("Bunday API topilmadi");

  // Xatolik statusi
  error.statusCode = 404;

  // Xatoni errorHandler ga yuborish
  next(error);
};


// 2. XATOLARNI USHLASH
export const errorHandler = (error, req, res, next) => {
  // Xatoni terminalda ko'rsatish
  console.error(error);

  // Xatolik statusi
  const status = error.statusCode || 500;

  // Xatolik xabari
  let message = error.message || "Server xatosi";

  // Ichki server xatolarini foydalanuvchiga ko'rsatmaslik
  if (status === 500) {
    message = "Server xatosi";
  }

  // Frontendga javob qaytarish
  return res.status(status).json({
    message: message,
  });
};
