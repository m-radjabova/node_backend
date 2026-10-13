
import Lead, { leadStatuses } from "../models/Lead.js";


// Status nomlari
const statusLabels = {
  new: "Yangi",
  in_progress: "Jarayonda",
  proposal: "Taklif yuborilgan",
  won: "Yutildi",
  lost: "Yo'qotildi",
};


// Oy nomlari
const monthLabels = [
  "Yan", "Fev", "Mar", "Apr",
  "May", "Iyn", "Iyl", "Avg",
  "Sen", "Okt", "Noy", "Dek",
];


// Foiz o'zgarishini hisoblash
const percentChange = (current, previous) => {
  if (previous > 0) {
    return Math.round(
      ((current - previous) / previous) * 100
    );
  }

  if (current > 0) {
    return 100;
  }

  return 0;
};


// REPORT OLISH
export const getMyReport = async (req, res, next) => {
  try {
    // 1. SANALARNI OLISH
    const now = new Date();

    // Tugash sanasi
    const end = req.query.to
      ? new Date(req.query.to)
      : now;

    // Boshlanish sanasi (oxirgi 30 kun)
    const start = req.query.from
      ? new Date(req.query.from)
      : new Date(
          end.getFullYear(),
          end.getMonth(),
          end.getDate() - 29
        );

    // Sanalarni tekshirish
    if (
      isNaN(start.getTime()) ||
      isNaN(end.getTime()) ||
      start > end
    ) {
      return res.status(400).json({
        message: "Sana oralig'i noto'g'ri",
      });
    }

    // Tugash kunini ham hisobga olish
    const endExclusive = new Date(end);
    endExclusive.setDate(endExclusive.getDate() + 1);

    // Kunlar sonini hisoblash
    const rangeDays = Math.max(
      Math.ceil((endExclusive - start) / 86400000),
      1
    );

    // Oldingi davr boshlanishi
    const previousStart = new Date(start);
    previousStart.setDate(
      previousStart.getDate() - rangeDays
    );

    // Tizimga kirgan foydalanuvchi
    const owner = req.user._id;


    // 2. YANGI MIJOZLAR
    const newClients = await Lead.countDocuments({
      owner,
      createdAt: {
        $gte: start,
        $lt: endExclusive,
      },
    });


    // 3. YUTILGAN BITIMLAR
    const wonDeals = await Lead.countDocuments({
      owner,
      status: "won",
      updatedAt: {
        $gte: start,
        $lt: endExclusive,
      },
    });


    // 4. OLDINGI DAVRDAGI MIJOZLAR
    const previousClients = await Lead.countDocuments({
      owner,
      createdAt: {
        $gte: previousStart,
        $lt: start,
      },
    });


    // 5. OLDINGI DAVRDAGI YUTILGAN BITIMLAR
    const previousDeals = await Lead.countDocuments({
      owner,
      status: "won",
      updatedAt: {
        $gte: previousStart,
        $lt: start,
      },
    });


    // 6. UMUMIY DAROMAD
    const revenueData = await Lead.aggregate([
      {
        $match: {
          owner,
          status: "won",
          updatedAt: {
            $gte: start,
            $lt: endExclusive,
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$value" },
        },
      },
    ]);

    const revenue = revenueData[0]?.total || 0;


    // 7. OLDINGI DAVRDAGI DAROMAD
    const previousRevenueData = await Lead.aggregate([
      {
        $match: {
          owner,
          status: "won",
          updatedAt: {
            $gte: previousStart,
            $lt: start,
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$value" },
        },
      },
    ]);

    const previousRevenue =
      previousRevenueData[0]?.total || 0;


    // 8. KONVERSIYANI HISOBLASH
    let conversion = 0;

    if (newClients > 0) {
      conversion = Math.round(
        (wonDeals / newClients) * 100
      );
    }

    // Oldingi davr konversiyasi
    let previousConversion = 0;

    if (previousClients > 0) {
      previousConversion = Math.round(
        (previousDeals / previousClients) * 100
      );
    }


    // 9. STATUSLAR BO'YICHA STATISTIKA
    const statusData = await Lead.aggregate([
      {
        $match: {
          owner,
          createdAt: {
            $gte: start,
            $lt: endExclusive,
          },
        },
      },
      {
        $group: {
          _id: "$status",
          total: { $sum: 1 },
        },
      },
    ]);

    // Jami statuslar soni
    let totalStatus = 0;

    for (const item of statusData) {
      totalStatus += item.total;
    }

    const statuses = [];

    for (const status of leadStatuses) {
      let count = 0;

      // Shu statusdagi leadlar sonini topish
      for (const item of statusData) {
        if (item._id === status) {
          count = item.total;
        }
      }

      let percent = 0;

      if (totalStatus > 0) {
        percent = Math.round(
          (count / totalStatus) * 100
        );
      }

      statuses.push({
        key: status,
        label: statusLabels[status],
        count,
        percent,
      });
    }


    // 10. OYLIK STATISTIKA
    const monthlyData = await Lead.aggregate([
      {
        $match: {
          owner,
          createdAt: {
            $gte: start,
            $lt: endExclusive,
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          newClients: { $sum: 1 },

          wonDeals: {
            $sum: {
              $cond: [
                { $eq: ["$status", "won"] },
                1,
                0,
              ],
            },
          },

          revenue: {
            $sum: {
              $cond: [
                { $eq: ["$status", "won"] },
                "$value",
                0,
              ],
            },
          },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);

    const monthly = [];

    for (const item of monthlyData) {
      const month = monthLabels[item._id.month - 1];

      monthly.push({
        label: `${month} ${item._id.year}`,
        newClients: item.newClients,
        wonDeals: item.wonDeals,
        revenue: item.revenue,
      });
    }


    // 11. ENG YAXSHI 5 TA KOMPANIYA
    const topCompaniesData = await Lead.aggregate([
      {
        $match: {
          owner,
          createdAt: {
            $gte: start,
            $lt: endExclusive,
          },
          company: {
            $nin: [null, ""],
          },
        },
      },
      {
        $group: {
          _id: "$company",
          clients: { $sum: 1 },

          wonDeals: {
            $sum: {
              $cond: [
                { $eq: ["$status", "won"] },
                1,
                0,
              ],
            },
          },

          revenue: {
            $sum: {
              $cond: [
                { $eq: ["$status", "won"] },
                "$value",
                0,
              ],
            },
          },
        },
      },
      {
        $sort: {
          revenue: -1,
          clients: -1,
        },
      },
      {
        $limit: 5,
      },
    ]);

    const topCompanies = [];

    for (const item of topCompaniesData) {
      let companyConversion = 0;

      if (item.clients > 0) {
        companyConversion = Math.round(
          (item.wonDeals / item.clients) * 100
        );
      }

      topCompanies.push({
        company: item._id,
        clients: item.clients,
        wonDeals: item.wonDeals,
        conversion: companyConversion,
        revenue: item.revenue,
      });
    }


    // 12. FRONTENDGA NATIJANI YUBORISH
    return res.status(200).json({
      period: {
        from: start,
        to: end,
      },

      metrics: {
        newClients,
        wonDeals,
        revenue,
        conversion,

        changes: {
          newClients: percentChange(
            newClients,
            previousClients
          ),

          wonDeals: percentChange(
            wonDeals,
            previousDeals
          ),

          revenue: percentChange(
            revenue,
            previousRevenue
          ),

          conversion: conversion - previousConversion,
        },
      },

      monthly,
      statuses,
      topCompanies,
    });

  } catch (error) {
    next(error);
  }
};
