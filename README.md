# CRM API — autentifikatsiya

Node.js, Express va MongoDB (MongoDB Atlas/Neon emas) asosidagi CRM autentifikatsiya skeleti.

## Sozlash

1. `.env.example` faylidan nusxa olib `.env` yarating.
2. Undagi `MONGO_URI` qiymatiga MongoDB Atlas connection string'ingizni yozing.
3. `JWT_ACCESS_SECRET` va `JWT_REFRESH_SECRET` uchun bir-biridan farqli, uzun tasodifiy qiymatlar qo'ying. Ularni Git'ga yubormang.
4. `npm start` bilan serverni ishga tushiring. Standart manzil: `http://localhost:8000`.

`GET /health` server holatini tekshiradi.


Demo ma'lumotlarni qo‘shish uchun `npm run seed` ishlating. U uchta manager va ularga tegishli alohida leadlarni qo‘shadi. Demo managerlarning paroli: `Manager123!`. Scriptni qayta ishga tushirish dublikat lead yoki user yaratmaydi.

## Tuzilma

```text
config/       # database va environment sozlamalari
models/       # MongoDB sxemalari
validators/   # request validatsiyasi
controllers/  # biznes mantiqi
routes/       # endpointlar
middleware/   # JWT va xatolik middleware'lari
utils/        # token yaratish/saqlash yordamchilari
```

## Rollar

`user`, `manager`, `admin` rollari mavjud. Ochiq `/auth/register` endpointi har doim yangi foydalanuvchini `user` rolida yaratadi; client request orqali rol tanlay olmaydi. Keyinchalik admin panel/API orqali manager yoki admin tayinlash xavfsizroq bo'ladi. `authorize(...roles)` middleware'i ushbu protected endpointlar uchun tayyor.

## Endpointlar

| Method | URL | Nima qiladi |
| --- | --- | --- |
| POST | `/auth/register` | `fullName`, `email`, `password` bilan ro'yxatdan o'tish |
| POST | `/auth/login` | Email va parol bilan kirish |
| POST | `/auth/refresh` | Refresh tokenni yangisiga almashtirish |
| POST | `/auth/logout` | Refresh tokenni bekor qilish |
| GET | `/users/me` | Joriy profilni olish |
| PATCH | `/users/me` | `fullName` va/yoki `phone` yangilash |
| PATCH | `/users/me/password` | Joriy parol orqali yangi parol o'rnatish |
| GET | `/admin/users` | Faqat admin: userlar ro'yxati |
| PATCH | `/admin/users/:userId/role` | Faqat admin: user rolini almashtirish |
| POST | `/leads` | Faqat manager: o'ziga tegishli lead yaratish |
| GET | `/leads` | Faqat manager: faqat o'z leadlari ro'yxati |
| GET | `/leads/board` | Faqat manager: Kanban uchun o'z leadlarini statuslarga guruhlash |
| GET | `/leads/:leadId` | Faqat manager: o'z leadini olish |
| PATCH | `/leads/:leadId` | Faqat manager: o'z leadini tahrirlash |
| PATCH | `/leads/:leadId/status` | Faqat manager: drag-and-drop orqali statusni almashtirish |
| DELETE | `/leads/:leadId` | Faqat manager: o'z leadini o'chirish |

`/users/*` so'rovlarida header bo'lishi shart:

```http
Authorization: Bearer ACCESS_TOKEN
```

## Request namunalari

```json
POST /auth/register
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "StrongPass1!"
}
```

```json
PATCH /users/me
{
  "phone": "+998901234567"
}
```

```json
PATCH /users/me/password
{
  "currentPassword": "StrongPass1!",
  "newPassword": "NewStrong1!"
}
```

Parol kamida 8 belgi, kichik va katta harf, raqam hamda maxsus belgidan iborat bo'lishi kerak. Parollar `bcrypt` orqali hash qilinadi; javoblarda va oddiy user so'rovlarida hech qachon qaytarilmaydi. Refresh tokenlarning o'zi ham MongoDB'da emas, ularning bcrypt hash'i saqlanadi. Access token 15 daqiqa, refresh token 7 kun (ikkalasi `.env` orqali o'zgartiriladi) amal qiladi. Refresh endpoint token rotation qiladi, parol o'zgarganda esa barcha refresh sessionlar bekor qilinadi.

Admin userlarni `GET /admin/users?page=1&limit=20&search=ali` orqali qidirishi mumkin. Rolni almashtirish uchun `PATCH /admin/users/:userId/role` body: `{ "role": "manager" }`. Admin o'z rolini ushbu endpoint orqali o'zgartira olmaydi.

## Leadlar (manager)

Manager yangi lead yaratganda `owner` maydoni requestdan emas, login bo'lgan managerdan olinadi. Shu sababli manager faqat o'z leadlarini ko'radi, tahrirlaydi va o'chiradi. Boshqa managerning lead ID'sini yuborsa ham `404` qaytadi.

```json
POST /leads
{
  "name": "Afka Group",
  "company": "Afka Group",
  "description": "CRM xizmatlari bo'yicha hamkorlik",
  "value": 5000,
  "contactName": "Azizbek Karimov",
  "contactEmail": "azizbek@afka.uz",
  "contactPhone": "+998901234567"
}
```

Kanban holatlari: `new`, `in_progress`, `proposal`, `won`, `lost`. Drag-and-drop tugagach frontend faqat quyidagi requestni yuboradi:

```json
PATCH /leads/:leadId/status
{
  "status": "proposal"
}
```
