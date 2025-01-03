const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");
const moment = require("moment");
admin.initializeApp();

exports.createSubscriptionPlan = functions.firestore
    .document("/tmpSubscriptions/{documentId}")
    .onCreate(async (snapshot, context) => {
      const planMap = {
        free: "Explorer Plan",
        standard: "Standard Plan",
        unlimited: "Unlimited Plan",
      };

      const documentId = context.params.documentId;
      const original = snapshot.data().original;
      // plan, userId
      functions.logger
          .log(
              "document added to temporal subscriptions",
              documentId,
              original,
          );

      const db = admin.firestore();

      const planDocument = await db.collection("Plans")
          .where("name", "==", planMap[original.plan])
          .limit(1)
          .get();

      if (planDocument.empty) {
        functions.logger.log(`plan does not exists`);
        return;
      }

      const plan = planDocument.docs[0];

      if (plan.price === 0) {
        const userFreePlans = await db.collection("userSubscriptions")
            .where("user.uid", original.userId)
            .get();

        if (!userFreePlans.empty) {
          functions.logger.log(`user already subscribed to free plan`);
          return;
        }
      }

      const user = admin.auth().getUser(original.userId);
      const startDate = moment();
      const endDate = moment().add(plan.time, "days");

      const data = {
        plan,
        user,
        startDate,
        endDate,
        occurrence: plan.occurrence,
        occurrenceType: plan.occurentType,
      };

      functions.logger
          .log(`saving user subscription data ${JSON.stringify(data)}`);

      await db.collection("userSubscriptions").add(data);

      await db.collection("tmpSubscriptions").doc(documentId).delete();
    });

exports.handleStripWebhook = functions.https.onRequest(async (req, res) => {
  const body = req.body;
});