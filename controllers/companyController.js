
import mongoose from "mongoose";
import Company, { companyStatuses } from "../models/Company.js";


// 1. YANGI KOMPANIYA QO'SHISH
export const createCompany = async (req, res, next) => {
  try {
    // Frontenddan ma'lumotlarni olish
    const {
      name,
      industry,
      description,
      contactName,
      contactEmail,
      contactPhone,
      website,
      status,
    } = req.body;

    // Yangi kompaniya yaratish
    const company = await Company.create({
      name,
      industry,
      description,
      contactName,
      contactEmail,
      contactPhone,
      website,
      status,
      owner: req.user._id,
    });

    // Natijani frontendga yuborish
    return res.status(201).json({
      message: "Kompaniya yaratildi",
      company,
    });

  } catch (error) {
    next(error);
  }
};


// 2. BARCHA KOMPANIYALARNI OLISH
export const listMyCompanies = async (req, res, next) => {
  try {
    // Sahifa va limit
    const page = Math.max(
      Number.parseInt(req.query.page, 10) || 1,
      1
    );

    const limit = Math.min(
      Math.max(Number.parseInt(req.query.limit, 10) || 10, 1),
      100
    );

    // Qidiruv va status
    const search = req.query.search || "";
    const status = req.query.status;

    // Faqat o'z kompaniyalarini olish
    const filter = {
      owner: req.user._id,
    };

    // Status bo'yicha filter
    if (status) {
      if (!companyStatuses.includes(status)) {
        return res.status(400).json({
          message: "Holat noto'g'ri",
        });
      }

      filter.status = status;
    }

    // Nomi yoki boshqa ma'lumotlar orqali qidirish
    if (search.trim()) {
      filter.$or = [
        {
          name: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          industry: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          contactName: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          contactEmail: {
            $regex: search.trim(),
            $options: "i",
          },
        },
      ];
    }

    // Kompaniyalar sonini olish
    const total = await Company.countDocuments(filter);

    // Sahifalar soni
    const totalPages = Math.ceil(total / limit);

    // Sahifani tekshirish
    const safePage = totalPages
      ? Math.min(page, totalPages)
      : 1;

    // Kompaniyalarni olish
    const companies = await Company.find(filter)
      .sort({ updatedAt: -1, _id: -1 })
      .skip((safePage - 1) * limit)
      .limit(limit);

    // Natijani yuborish
    return res.status(200).json({
      companies,
      pagination: {
        page: safePage,
        limit,
        total,
        totalPages,
      },
    });

  } catch (error) {
    next(error);
  }
};


// 3. BITTA KOMPANIYANI OLISH
export const getMyCompany = async (req, res, next) => {
  try {
    // URL dan kompaniya ID sini olish
    const companyId = req.params.companyId;

    // ID to'g'riligini tekshirish
    if (!mongoose.isValidObjectId(companyId)) {
      return res.status(400).json({
        message: "Kompaniya ID noto'g'ri",
      });
    }

    // Kompaniyani topish
    const company = await Company.findOne({
      _id: companyId,
      owner: req.user._id,
    });

    // Kompaniya mavjud bo'lmasa
    if (!company) {
      return res.status(404).json({
        message: "Kompaniya topilmadi",
      });
    }

    // Natijani yuborish
    return res.status(200).json({
      company,
    });

  } catch (error) {
    next(error);
  }
};


// 4. KOMPANIYANI YANGILASH
export const updateMyCompany = async (req, res, next) => {
  try {
    const companyId = req.params.companyId;

    // ID ni tekshirish
    if (!mongoose.isValidObjectId(companyId)) {
      return res.status(400).json({
        message: "Kompaniya ID noto'g'ri",
      });
    }

    // Faqat o'zgartirish mumkin bo'lgan maydonlar
    const allowedFields = [
      "name",
      "industry",
      "description",
      "contactName",
      "contactEmail",
      "contactPhone",
      "website",
      "status",
    ];

    const updates = {};

    // Frontenddan kelgan ruxsat etilgan maydonlarni olish
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    // Kompaniyani yangilash
    const company = await Company.findOneAndUpdate(
      {
        _id: companyId,
        owner: req.user._id,
      },
      { $set: updates },
      {
        new: true,
        runValidators: true,
      }
    );

    // Kompaniya topilmasa
    if (!company) {
      return res.status(404).json({
        message: "Kompaniya topilmadi",
      });
    }

    // Natijani yuborish
    return res.status(200).json({
      message: "Kompaniya yangilandi",
      company,
    });

  } catch (error) {
    next(error);
  }
};


// 5. KOMPANIYANI O'CHIRISH
export const deleteMyCompany = async (req, res, next) => {
  try {
    const companyId = req.params.companyId;

    // ID ni tekshirish
    if (!mongoose.isValidObjectId(companyId)) {
      return res.status(400).json({
        message: "Kompaniya ID noto'g'ri",
      });
    }

    // Kompaniyani o'chirish
    const company = await Company.findOneAndDelete({
      _id: companyId,
      owner: req.user._id,
    });

    // Kompaniya topilmasa
    if (!company) {
      return res.status(404).json({
        message: "Kompaniya topilmadi",
      });
    }

    // Muvaffaqiyatli o'chirildi
    return res.status(204).send();

  } catch (error) {
    next(error);
  }
};