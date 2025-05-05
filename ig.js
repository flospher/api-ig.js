const { Instaloader } = require('instaloader');
const express = require('express');

const router = express.Router();
const L = new Instaloader({
  requestTimeout: 30000,
  maxConnectionAttempts: 3,
  userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
});

router.get('/', async (req, res) => {
  try {
    const username = req.query.user;
    
    if (!username) {
      return res.status(400).json({
        meta: { success: false, code: 400 },
        error: "❌ Username parameter is required. Use /api/ig?user=username"
      });
    }

    const profile = await getInstagramProfile(username);
    const formattedResponse = formatProfileResponse(profile);
    
    res.json(formattedResponse);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      meta: { success: false, code: 500 },
      error: `❌ ${error.message}`
    });
  }
});

async function getInstagramProfile(username) {
  try {
    return await Instaloader.Profile.from_username(L.context, username);
  } catch (error) {
    throw new Error(`Instagram connection failed. Please try again later. (Error: ${error.message})`);
  }
}

function formatProfileResponse(profile) {
  const creationDate = profile.created_date 
    ? profile.created_date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
    : "Not Available";

  return {
    meta: {
      success: true,
      code: 200,
      message: "✨ Profile data fetched successfully"
    },
    data: {
      "📌 Name": profile.full_name || "Not Available",
      "🔗 Username": `@${profile.username}`,
      "🆔 User ID": profile.userid,
      "📅 Created At": creationDate,
      "📝 Bio": profile.biography || "Not Available",
      "🏢 Business Category": profile.is_business_account 
        ? (profile.business_category_name || "Business Account") 
        : "Not Business Account",
      "🌐 External URL": profile.external_url || "Not Available",
      "👥 Followers": profile.followers.toLocaleString(),
      "👤 Following": profile.followees.toLocaleString(),
      "📸 Total Posts": profile.mediacount.toLocaleString(),
      "🔒 Private": profile.is_private ? "Yes" : "No",
      "✅ Verified": profile.is_verified ? "Yes" : "No",
      "💼 Business Account": profile.is_business_account ? "Yes" : "No",
      "🖼️ Profile Picture": profile.profile_pic_url || "Not Available",
      "🔗 Profile URL": `https://www.instagram.com/${profile.username}/`
    }
  };
}

module.exports = router;
