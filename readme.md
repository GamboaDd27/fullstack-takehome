# **Morphy Backend**
🚀 **Node.js + Express + PostgreSQL Backend** for the Morphy educational platform.

## **📦 Setup & Installation**
### **1️⃣ Clone the Repository**
```sh
git clone https://github.com/yourusername/morphy-backend.git
cd morphy-backend
```

### **2️⃣ Install Dependencies**
```sh
npm install
```

### **3️⃣ Set Up Environment Variables**
Create a **`.env`** file in the root directory:
```
PORT=5000
DATABASE_URL=postgres://user:password@localhost:5432/morphydb
JWT_SECRET=your-secret-key
```

### **4️⃣ Run Migrations & Seed Database**
```sh
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

### **5️⃣ Start the Server**
#### **🚀 Development Mode**
```sh
npm run dev
```
#### **🚀 Production Mode**
```sh
npm run build && npm start
```

---

## **📡 API Endpoints**
### **🔑 Authentication**
- `POST /api/auth/signup` → Register a new user
- `POST /api/auth/login` → Authenticate and get a JWT

### **📚 Courses**
- `GET /api/courses` → Fetch all courses
- `GET /api/courses/:id` → Fetch a specific course
- `POST /api/courses` → Create a new course (**Admin/Teacher only**)

### **📖 Lessons**
- `GET /api/lessons/:id` → Fetch lesson details
- `POST /api/lessons` → Create a new lesson (**Admin/Teacher only**)

### **📈 Progress**
- `GET /api/courses/:id/progress` → Fetch user’s progress for a course

---

## **🛠 Tech Stack**
- **Backend:** Node.js, Express, Sequelize
- **Database:** PostgreSQL
- **Authentication:** JWT
