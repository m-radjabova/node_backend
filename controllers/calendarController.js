
import Lead from "../models/Lead.js";
import Task from "../models/Task.js";


export const listMyEvents = async (req, res, next) => {
  try {
    // Frontenddan sanalarni olish
    const from = new Date(req.query.from);
    const to = new Date(req.query.to);

    // Sanalar to'g'riligini tekshirish
    if (
      isNaN(from.getTime()) ||
      isNaN(to.getTime()) ||
      from >= to
    ) {
      return res.status(400).json({
        message: "Sana oralig'i noto'g'ri",
      });
    }

    // Foydalanuvchiga tegishli leadlarni olish
    const leads = await Lead.find({
      owner: req.user._id,
      nextActionAt: {
        $gte: from,
        $lt: to,
      },
    }).sort({ nextActionAt: 1 });

    // Kalendar uchun eventlar ro'yxati
    const events = [];

    // Har bir leadni eventga aylantirish
    for (const lead of leads) {
      // Event nomini aniqlash
      let title = "";

      if (lead.nextActionType === "meeting") {
        title = "Uchrashuv";
      } else if (lead.nextActionType === "call") {
        title = "Qo'ng'iroq";
      } else {
        title = "Follow-up";
      }

      // Event rangini aniqlash
      let color = "purple";

      if (lead.nextActionType === "meeting") {
        color = "blue";
      } else if (lead.nextActionType === "call") {
        color = "amber";
      }

      // Event tugash vaqti (1 soatdan keyin)
      const start = new Date(lead.nextActionAt);

      const end = new Date(
        start.getTime() + 60 * 60 * 1000
      );

      // Yangi event yaratish
      const event = {
        id: lead._id,
        leadId: lead._id,
        title: `${title}: ${lead.company || lead.name}`,
        description: lead.name,
        start: start,
        end: end,
        color: color,
        actionType: lead.nextActionType,
        status: lead.status,
      };

      // Eventni ro'yxatga qo'shish
      events.push(event);
    }

    // Tasklar ham shu vaqt oralig'ida Calendar'ga avtomatik tushadi.
    const tasks = await Task.find({
      owner: req.user._id,
      dueAt: { $gte: from, $lt: to },
    }).populate("lead", "name company").sort({ dueAt: 1 });

    for (const task of tasks) {
      const start = new Date(task.dueAt);
      const end = new Date(start.getTime() + 60 * 60 * 1000);
      const color = task.status === "done" ? "emerald" : task.priority === "high" ? "rose" : task.priority === "low" ? "blue" : "purple";
      events.push({
        id: `task:${task._id}`,
        taskId: task._id,
        title: task.title,
        description: task.description || (task.lead?.company || task.lead?.name || null),
        start,
        end,
        color,
        actionType: "task",
        status: task.status,
      });
    }

    // Frontendga eventlarni yuborish
    return res.status(200).json({
      events: events,
    });

  } catch (error) {
    next(error);
  }
};
