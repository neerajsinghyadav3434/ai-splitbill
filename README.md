# 💸 AI SplitBill — Smart Expense Splitting App

A production-ready full-stack **AI-powered expense splitting** application built with **Next.js 15**, **Convex**, **Clerk**, and **Google Gemini AI**. The platform enables users to intelligently split bills, track shared expenses, perform real-time settlements, and receive AI-driven financial insights and automated reminders.

---

## 🎥 Demo

* 🔗 **Live App:** *(add deployed URL here)*
* 🎬 **Demo Video:** *(add demo video link here)*

---

## 🚀 Features

* 🔐 **Authentication** — Secure sign-in/sign-up via Clerk
* 👥 **Groups & Contacts** — Create groups, add friends, and manage contacts
* 💰 **Expense Tracking** — Add, categorize, and split expenses (equal, percentage, exact)
* 🤝 **Settlements** — Settle debts via Razorpay payment integration or offline
* 🤖 **AI Spending Insights** — Gemini AI analyzes spending patterns and provides personalized insights
* 📧 **Email Reminders** — Automated payment reminders via Resend and Inngest
* 🎂 **Birthday Notifications** — Get notified about friends' birthdays and send greetings
* 📊 **Dashboard** — Balance summaries, expense charts, and group overviews
* 🌙 **Dark Mode** — Full dark/light theme support

---

## ✨ Key Enhancements

This implementation includes several production-level improvements:

* 💳 **Razorpay Payment Integration** — Real online debt settlement within groups
* 🎂 **Birthday Notification System** — Automated birthday reminders for group members
* 🎨 **Enhanced UI/UX** — Improved layouts, responsiveness, and dark mode polish
* ⚡ **Performance Optimizations** — Optimized Convex queries and component rendering

---

## 🛠️ Tech Stack

| Layer              | Technology              |
| ------------------ | ----------------------- |
| Framework          | Next.js 15 (App Router) |
| Database & Backend | Convex                  |
| Authentication     | Clerk                   |
| AI                 | Google Gemini AI        |
| Background Jobs    | Inngest                 |
| Payments           | Razorpay                |
| Email              | Resend                  |
| UI Components      | shadcn/ui + Radix UI    |
| Styling            | Tailwind CSS v4         |
| Charts             | Recharts                |

---

## 📦 Getting Started

### Prerequisites

* Node.js 18+
* Convex account
* Clerk account
* Resend account
* Google AI Studio API key (Gemini)

---

### Installation

```bash
git clone https://github.com/neerajsinghyadav3434/ai-splitbill.git
cd ai-splitbill
npm install
```

Create environment file:

```bash
cp .env.example .env.local
```

Add required variables:

```env
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
CLERK_JWT_ISSUER_DOMAIN=

RESEND_API_KEY=
GEMINI_API_KEY=

NEXT_PUBLIC_RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

Run development servers:

```bash
npx convex dev
npm run dev
```

Open:

```
http://localhost:3000
```

---

## 📁 Project Structure

```
ai-splitbill/
├── app/
├── components/
├── convex/
├── hooks/
├── lib/
└── public/
```

---

## 🔐 Security

* Secrets stored in `.env.local` (gitignored)
* Never commit environment files
* Use `.env.example` as template

---

## 🙏 Inspiration

This project was inspired by a Splitwise-style full-stack tutorial.
The implementation has been significantly extended with new features, UI improvements, and payment integration.

---

## 📄 License

This project is available under the MIT License.
