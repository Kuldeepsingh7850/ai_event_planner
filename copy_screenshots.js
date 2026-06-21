const fs = require('fs');
const path = require('path');

const srcDir = "C:\\Users\\H\\.gemini\\antigravity\\brain\\81ff7180-48d8-40b1-9fcc-8912ee6767ae";
const destDir = path.join(__dirname, "presentation_images");

if (!fs.existsSync(destDir)){
    fs.mkdirSync(destDir, { recursive: true });
}

const fileMap = {
  "db_relationships_1781452851965.png": "09_Database_ER_Diagram.png",
  "user_workflow_1781432102419.png": "10a_User_Workflow_Diagram.png",
  "admin_workflow_1781432124635.png": "10b_Admin_Workflow_Diagram.png",
  "homepage_desktop_1781513675989.png": "11_Homepage_Desktop.png",
  "user_login_1781513708929.png": "12a_User_Login.png",
  "user_registration_1781513692054.png": "12b_User_Registration.png",
  "user_dashboard_1781513783851.png": "13a_User_Dashboard.png",
  "event_details_page_1781513765924.png": "13b_Event_Details_Page.png",
  "create_event_ai_1781513749384.png": "14a_AI_Recommendations.png",
  "profile_page_user_1781513800947.png": "14b_User_Profile.png",
  "admin_panel_dashboard_1781513817734.png": "15a_Admin_Dashboard.png",
  "admin_user_management_1781513836055.png": "15b_Admin_User_Management.png",
  "mobile_home_navigation_1781513852511.png": "16a_Mobile_Home_Navigation.png",
  "mobile_create_dashboard_1781513869386.png": "16b_Mobile_Create_Dashboard.png"
};

console.log("Starting copy process...");
let count = 0;

Object.entries(fileMap).forEach(([srcName, destName]) => {
  const srcPath = path.join(srcDir, srcName);
  const destPath = path.join(destDir, destName);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`✅ Copied: ${srcName} -> ${destName}`);
    count++;
  } else {
    console.warn(`⚠️ Source file not found: ${srcName}`);
  }
});

console.log(`\nCopy process complete. Total files copied: ${count}/${Object.keys(fileMap).length}`);
console.log(`Directory: ${destDir}`);
