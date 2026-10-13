export const validate = (schema) => {
  return (req, res, next) => {
    // Kelgan ma'lumotlarni tekshirish
    const result = schema.validate(req.body, {
      abortEarly: true,
      stripUnknown: true,
    });

    // Xatolik bo'lsa
    if (result.error) {
      return res.status(400).json({
        message: result.error.details[0].message,
      });
    }

    // Tekshiruvdan o'tgan ma'lumotlarni saqlash
    req.body = result.value;

    // Keyingi middleware yoki controllerga o'tish
    next();
  };
};
