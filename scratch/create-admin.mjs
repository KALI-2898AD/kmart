import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = "mongodb://localhost:27017/synra-market";

const UserSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, unique: true },
  password: { type: String },
  role: { type: String, enum: ["user", "admin"], default: "user" },
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function createAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB.");

    const adminEmail = "admin@kmart.web.in";
    const adminPassword = "adminPassword123!";
    
    // Check if admin already exists
    const existing = await User.findOne({ email: adminEmail });
    if (existing) {
      console.log(`Admin account ${adminEmail} already exists.`);
      await mongoose.disconnect();
      return;
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    await User.create({
      name: "Super Admin",
      email: adminEmail,
      password: hashedPassword,
      role: "admin"
    });

    console.log("-----------------------------------------");
    console.log("Admin account created successfully!");
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log("-----------------------------------------");

    await mongoose.disconnect();
  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  }
}

createAdmin();
