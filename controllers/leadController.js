
import mongoose from "mongoose";
import Lead, { leadStatuses } from "../models/Lead.js";


// 1. YANGI LEAD YARATISH
export const createLead = async (req, res, next) => {
  try {
    // Frontenddan ma'lumotlarni olish
    const {
      name,
      company,
      description,
      value,
      status,
      contactName,
      contactEmail,
      contactPhone,
      nextActionAt,
      nextActionType,
    } = req.body;

    // Yangi lead yaratish
    const lead = await Lead.create({
      name,
      company,
      description,
      value,
      status,
      contactName,
      contactEmail,
      contactPhone,
      nextActionAt,
      nextActionType,
      owner: req.user._id,
    });

    return res.status(201).json({
      message: "Lead yaratildi",
      lead,
    });

  } catch (error) {
    next(error);
  }
};


// 2. BARCHA LEADLARNI OLISH
export const listMyLeads = async (req, res, next) => {
  try {
    // Sahifa va limit
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit, 10) || 20)
    );

    // Frontenddan filterlarni olish
    const { status, search } = req.query;

    // Faqat o'z leadlarini olish
    const filter = {
      owner: req.user._id,
    };

    // Status bo'yicha filterlash
    if (status) {
      if (!leadStatuses.includes(status)) {
        return res.status(400).json({
          message: "Status noto'g'ri",
        });
      }

      filter.status = status;
    }

    // Ism yoki kompaniya orqali qidirish
    if (typeof search === "string" && search.trim()) {
      const query = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      filter.$or = [
        { name: { $regex: query, $options: "i" } },
        { company: { $regex: query, $options: "i" } },
      ];
    }

    // Leadlar sonini olish
    const total = await Lead.countDocuments(filter);

    // Leadlarni olish
    const leads = await Lead.find(filter)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Frontendga javob yuborish
    return res.json({
      leads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    next(error);
  }
};


// 3. BITTA LEADNI OLISH
export const getMyLead = async (req, res, next) => {
  try {
    const { leadId } = req.params;

    // ID ni tekshirish
    if (!mongoose.isValidObjectId(leadId)) {
      return res.status(400).json({
        message: "Lead ID noto'g'ri",
      });
    }

    // Leadni topish
    const lead = await Lead.findOne({
      _id: leadId,
      owner: req.user._id,
    });

    if (!lead) {
      return res.status(404).json({
        message: "Lead topilmadi",
      });
    }

    return res.json({ lead });

  } catch (error) {
    next(error);
  }
};


// 4. LEADNI YANGILASH
export const updateMyLead = async (req, res, next) => {
  try {
    const { leadId } = req.params;

    // ID ni tekshirish
    if (!mongoose.isValidObjectId(leadId)) {
      return res.status(400).json({
        message: "Lead ID noto'g'ri",
      });
    }

    // Faqat o'zgartirish mumkin bo'lgan maydonlar
    const allowedFields = [
      "name",
      "company",
      "description",
      "value",
      "status",
      "contactName",
      "contactEmail",
      "contactPhone",
      "nextActionAt",
      "nextActionType",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    // Leadni yangilash
    const lead = await Lead.findOneAndUpdate(
      {
        _id: leadId,
        owner: req.user._id,
      },
      { $set: updates },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!lead) {
      return res.status(404).json({
        message: "Lead topilmadi",
      });
    }

    return res.json({
      message: "Lead yangilandi",
      lead,
    });

  } catch (error) {
    next(error);
  }
};


// 5. LEAD STATUSINI YANGILASH
export const updateMyLeadStatus = async (req, res, next) => {
  try {
    const { leadId } = req.params;
    const { status } = req.body;

    // ID ni tekshirish
    if (!mongoose.isValidObjectId(leadId)) {
      return res.status(400).json({
        message: "Lead ID noto'g'ri",
      });
    }

    // Status to'g'riligini tekshirish
    if (!leadStatuses.includes(status)) {
      return res.status(400).json({
        message: "Status noto'g'ri",
      });
    }

    // Lead statusini yangilash
    const lead = await Lead.findOneAndUpdate(
      {
        _id: leadId,
        owner: req.user._id,
      },
      { $set: { status } },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!lead) {
      return res.status(404).json({
        message: "Lead topilmadi",
      });
    }

    return res.json({
      message: "Lead statusi yangilandi",
      lead,
    });

  } catch (error) {
    next(error);
  }
};


// 6. LEADNI O'CHIRISH
export const deleteMyLead = async (req, res, next) => {
  try {
    const { leadId } = req.params;

    // ID ni tekshirish
    if (!mongoose.isValidObjectId(leadId)) {
      return res.status(400).json({
        message: "Lead ID noto'g'ri",
      });
    }

    // Leadni o'chirish
    const lead = await Lead.findOneAndDelete({
      _id: leadId,
      owner: req.user._id,
    });

    if (!lead) {
      return res.status(404).json({
        message: "Lead topilmadi",
      });
    }

    return res.status(204).send();

  } catch (error) {
    next(error);
  }
};


// 7. KANBAN BOARD UCHUN LEADLAR
export const myLeadsBoard = async (req, res, next) => {
  try {
    // Faqat o'z leadlarini olish
    const leads = await Lead.find({
      owner: req.user._id,
    }).sort({ updatedAt: -1 });

    // Statuslar bo'yicha bo'sh ro'yxat yaratish
    const board = {};

    for (const status of leadStatuses) {
      board[status] = [];
    }

    // Har bir leadni o'z statusiga joylash
    for (const lead of leads) {
      if (board[lead.status]) {
        board[lead.status].push(lead);
      }
    }

    return res.json({ board });

  } catch (error) {
    next(error);
  }
};
