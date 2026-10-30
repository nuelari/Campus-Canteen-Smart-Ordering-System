const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const menuItems = [
  { 
    id: "jollof-chicken", 
    name: "Jollof Rice with Fried Chicken", 
    price: 2500, 
    veg: false, 
    category: "Rice",
    image: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?auto=format&fit=crop&w=600&q=80" 
  },
  { 
    id: "asun-goat", 
    name: "Asun (Spiced Grilled Goat)", 
    price: 3000, 
    veg: false, 
    category: "Grill",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80" 
  },
  { 
    id: "veg-rice", 
    name: "Fried Rice & Plantain", 
    price: 2200, 
    veg: true, 
    category: "Rice",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80" 
  },
  { 
    id: "stir-fry-indomie", 
    name: "Special Stir-fry Indomie & Eggs", 
    price: 1500, 
    veg: false, 
    category: "Noodles",
    image: "https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=600&q=80" 
  },
  { 
    id: "meat-pie", 
    name: "Meat Pie & Sausage Roll", 
    price: 1200, 
    veg: false, 
    category: "Snacks",
    image: "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&w=600&q=80" 
  },
  { 
    id: "cold-coffee", 
    name: "Chilled Zobo Drink / Iced Tea", 
    price: 800, 
    veg: true, 
    category: "Drinks",
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80" 
  },
];


app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    app: "Clifford Bites",
    persistence: "Firebase Auth + Firestore",
  });
});

app.get("/api/menu", (_req, res) => {
  res.json(menuItems);
});

app.get("/api/schema", (_req, res) => {
  res.json({
    sourceOfTruth: "Firestore",
    auth: "Firebase Authentication with Google provider",
    uidKey: "request.auth.uid",
    collections: {
      users: "users/{uid}",
      orders: "orders/{uid}/history/{orderId}",
      favorites: "favorites/{uid}",
      cart: "cart/{uid}",
      notifications: "notifications/{uid}",
      settings: "settings/{uid}",
    },
  });
});

const distDir = path.join(__dirname, "../dist");
const legacyPublicDir = path.join(__dirname, "../public");
const staticDir = fs.existsSync(path.join(distDir, "index.html")) ? distDir : legacyPublicDir;

app.use(express.static(staticDir));

app.get("*", (_req, res) => {
  const indexFile = path.join(staticDir, "index.html");
  if (fs.existsSync(indexFile)) {
    res.sendFile(indexFile);
    return;
  }

  res.status(404).send("Build the React app with npm run build first.");
});

module.exports = app;

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Clifford Bites server running at http://localhost:${PORT}`);
  });
}
