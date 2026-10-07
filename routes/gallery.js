const router = require("express").Router();

const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Place = require("../models/Place");
const GalleryRequest = require("../models/GalleryRequest");


// ==========================================
// AUTH MIDDLEWARE
// ==========================================

const auth = (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication required"
      });
    }

    const token = header.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;

    next();

  } catch (err) {
    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
};


// ==========================================
// GET ALL USERS
// ==========================================

router.get("/users", auth, async (req, res) => {
  try {

    const users = await User.find({
      _id: { $ne: req.user._id }
    })
      .select("_id username name")
      .sort({ username: 1 });

    res.status(200).json(users);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Unable to load users"
    });
  }
});


// ==========================================
// GET USER BY USERNAME
// ==========================================

router.get("/users/:username", auth, async (req, res) => {
  try {

    const username = req.params.username.toLowerCase();

    const user = await User.findOne({ username })
      .select("_id username name");

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // Check relationship
    const request = await GalleryRequest.findOne({
      requester: req.user._id,
      owner: user._id
    });

    res.status(200).json({
      user,
      requestStatus: request ? request.status : "none"
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Unable to load user"
    });
  }
});


// ==========================================
// SEND GALLERY REQUEST
// ==========================================

router.post(
  "/requests/:username",
  auth,
  async (req, res) => {

    try {

      const username = req.params.username.toLowerCase();

      const owner = await User.findOne({ username });

      if (!owner) {
        return res.status(404).json({
          message: "User not found"
        });
      }

      if (owner._id.toString() === req.user._id.toString()) {
        return res.status(400).json({
          message: "You cannot request your own gallery"
        });
      }

      let request = await GalleryRequest.findOne({
        requester: req.user._id,
        owner: owner._id
      });

      // Already accepted
      if (request && request.status === "accepted") {
        return res.status(400).json({
          message: "Gallery access already granted"
        });
      }

      // Already pending
      if (request && request.status === "pending") {
        return res.status(400).json({
          message: "Gallery request already pending"
        });
      }

      // Reuse rejected request
      if (request && request.status === "rejected") {

        request.status = "pending";

        await request.save();

      } else {

        request = await GalleryRequest.create({
          requester: req.user._id,
          owner: owner._id,
          status: "pending"
        });

      }

      res.status(201).json({
        message: "Gallery request sent",
        status: request.status
      });

    } catch (err) {

      console.error(err);

      res.status(500).json({
        message: "Unable to send gallery request"
      });
    }
  }
);


// ==========================================
// INCOMING REQUESTS
// ==========================================

router.get(
  "/requests/incoming",
  auth,
  async (req, res) => {

    try {

      const requests = await GalleryRequest.find({
        owner: req.user._id,
        status: "pending"
      })
        .populate("requester", "_id username name")
        .sort({ createdAt: -1 });

      res.status(200).json(requests);

    } catch (err) {

      console.error(err);

      res.status(500).json({
        message: "Unable to load requests"
      });
    }
  }
);


// ==========================================
// ACCEPT REQUEST
// ==========================================

router.patch(
  "/requests/:requestId/accept",
  auth,
  async (req, res) => {

    try {

      const request = await GalleryRequest.findOne({
        _id: req.params.requestId,
        owner: req.user._id,
        status: "pending"
      });

      if (!request) {
        return res.status(404).json({
          message: "Request not found"
        });
      }

      request.status = "accepted";

      await request.save();

      res.status(200).json({
        message: "Gallery access granted"
      });

    } catch (err) {

      console.error(err);

      res.status(500).json({
        message: "Unable to accept request"
      });
    }
  }
);


// ==========================================
// REJECT REQUEST
// ==========================================

router.patch(
  "/requests/:requestId/reject",
  auth,
  async (req, res) => {

    try {

      const request = await GalleryRequest.findOne({
        _id: req.params.requestId,
        owner: req.user._id,
        status: "pending"
      });

      if (!request) {
        return res.status(404).json({
          message: "Request not found"
        });
      }

      request.status = "rejected";

      await request.save();

      res.status(200).json({
        message: "Gallery request rejected"
      });

    } catch (err) {

      console.error(err);

      res.status(500).json({
        message: "Unable to reject request"
      });
    }
  }
);


// ==========================================
// GET PROTECTED GALLERY
// ==========================================

router.get(
  "/gallery/:username",
  auth,
  async (req, res) => {

    try {

      const username = req.params.username.toLowerCase();

      const owner = await User.findOne({ username })
        .select("_id username name");

      if (!owner) {
        return res.status(404).json({
          message: "User not found"
        });
      }

      // Owner can always see own gallery
      const isOwner =
        owner._id.toString() === req.user._id.toString();

      if (!isOwner) {

        const request = await GalleryRequest.findOne({
          requester: req.user._id,
          owner: owner._id,
          status: "accepted"
        });

        if (!request) {
          return res.status(403).json({
            message: "Gallery access has not been granted"
          });
        }
      }

      const places = await Place.find({
        userId: owner._id
      }).sort({
        createdAt: -1
      });

      res.status(200).json({
        user: owner,
        places
      });

    } catch (err) {

      console.error(err);

      res.status(500).json({
        message: "Unable to load gallery"
      });
    }
  }
);

// ==========================================
// GET USERS WITH GALLERY ACCESS
// ==========================================

router.get(
  "/requests/accepted",
  auth,
  async (req, res) => {
    try {

      const requests = await GalleryRequest.find({
        owner: req.user._id,
        status: "accepted"
      })
        .populate("requester", "_id username name")
        .sort({ updatedAt: -1 });

      res.status(200).json(requests);

    } catch (err) {

      console.error(err);

      res.status(500).json({
        message: "Unable to load gallery access"
      });
    }
  }
);


// ==========================================
// REMOVE GALLERY ACCESS
// ==========================================

router.patch(
  "/requests/:requestId/revoke",
  auth,
  async (req, res) => {
    try {

      const request = await GalleryRequest.findOne({
        _id: req.params.requestId,
        owner: req.user._id,
        status: "accepted"
      });

      if (!request) {
        return res.status(404).json({
          message: "Access not found"
        });
      }

      request.status = "rejected";

      await request.save();

      res.status(200).json({
        message: "Gallery access removed"
      });

    } catch (err) {

      console.error(err);

      res.status(500).json({
        message: "Unable to remove gallery access"
      });
    }
  }
);


module.exports = router;