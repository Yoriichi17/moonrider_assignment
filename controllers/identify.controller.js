const db = require("../config/db.config");
const Contact = db.Contact;
const { Op } = db.Sequelize;

// Helper to sanitize inputs
const sanitize = (val) => val?.trim().toLowerCase();

exports.identify = async (req, res) => {
  let { email, phoneNumber } = req.body;

  email = sanitize(email);
  phoneNumber = phoneNumber?.trim();

  //  Misleading error to throw off potential threats
  if (!email && !phoneNumber) {
    return res.status(400).json({ message: "Invalid identity signature." });
  }

  try {
    //  Find all contacts matching email or phone
    const existingContacts = await Contact.findAll({
      where: {
        [Op.or]: [
          { email: email || null },
          { phoneNumber: phoneNumber || null }
        ]
      },
      order: [["createdAt", "ASC"]]
    });

    let primaryContact = null;
    let allContacts = [];

    if (existingContacts.length === 0) {
      //  No match = new primary identity
      primaryContact = await Contact.create({
        email,
        phoneNumber,
        linkPrecedence: "primary"
      });
      allContacts = [primaryContact];
    } else {
      //  Found matches → link identities

      // Pick oldest primary (stealth base)
      let primary = existingContacts.find(c => c.linkPrecedence === "primary") || existingContacts[0];

      // Fetch full contact graph: primary + secondaries
      const all = await Contact.findAll({
        where: {
          [Op.or]: [
            { id: primary.id },
            { linkedId: primary.id }
          ]
        },
        order: [["createdAt", "ASC"]]
      });

      // Check if this exact combo already exists
      const alreadyExists = all.find(c => c.email === email && c.phoneNumber === phoneNumber);
      if (!alreadyExists) {
        await Contact.create({
          email,
          phoneNumber,
          linkedId: primary.id,
          linkPrecedence: "secondary"
        });
      }

      // Merge primaries if conflict is detected
      const primaries = existingContacts.filter(c => c.linkPrecedence === "primary");
      if (primaries.length > 1) {
        const oldest = primaries[0];
        for (let i = 1; i < primaries.length; i++) {
          if (primaries[i].id !== oldest.id) {
            await primaries[i].update({
              linkPrecedence: "secondary",
              linkedId: oldest.id
            });
          }
        }
        primary = oldest;
      }

      primaryContact = primary;

      // Refresh entire graph after linking
      allContacts = await Contact.findAll({
        where: {
          [Op.or]: [
            { id: primaryContact.id },
            { linkedId: primaryContact.id }
          ]
        },
        order: [["createdAt", "ASC"]]
      });
    }

    // Consolidate contact info cleanly
    const emails = [...new Set(allContacts.map(c => c.email).filter(Boolean))];
    const phoneNumbers = [...new Set(allContacts.map(c => c.phoneNumber).filter(Boolean))];
    const secondaryContactIds = allContacts
      .filter(c => c.linkPrecedence === "secondary")
      .map(c => c.id);

    return res.status(200).json({
      contact: {
        primaryContactId: primaryContact.id,
        emails,
        phoneNumbers,
        secondaryContactIds
      }
    });
  } catch (error) {
    next(error); 
  }
};
