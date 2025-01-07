const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");
const moment = require("moment");
admin.initializeApp();
const db = admin.firestore();

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

      const planDocument = await db.collection("Plans")
          .where("name", "==", planMap[original.plan])
          .limit(1)
          .get();

      if (planDocument.empty) {
        functions.logger.log(`plan does not exists`);
        return;
      }

      const plan = planDocument.docs[0];
      const planData = plan.data();

      if (planData.price === 0) {
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
      const endDate = moment().add(planData.time, "days");

      const data = {
        planData,
        user,
        startDate,
        endDate,
        occurrence: planData.occurrence,
        occurrenceType: planData.occurrenceType,
      };

      functions.logger
          .log(`saving user subscription data ${JSON.stringify(data)}`);

      await db.collection("userSubscriptions").add(data);

      await db.collection("tmpSubscriptions").doc(documentId).delete();
    });

exports.handleStripWebhook = functions.https.onRequest(async (req, res) => {
  const body = req.body;

  if (body["type"] === "checkout.session.completed") {
    const transactionId = body["data"]["object"]["metadata"]["transactionId"];
    const userId = body["data"]["object"]["metadata"]["userId"];
    const paymentStatus = body["data"]["object"]["payment_status"]

    if (paymentStatus !== "paid") {
      return res.status(200);
    }
    const paymentDocs = await db.collection(`payments/${userId}/subcollection`)
        .where("transactionId", "==", transactionId)
        .where("status", "==", "PENDING")
        .limit(1)
        .get();

    if (paymentDocs.empty) {
      return res.status(200);
    }

    const payment = paymentDocs.docs[0];
    const paymentData = payment.data();

    //update status of payment
    await db.collection(`payments/${userId}/subcollection`)
      .doc(payment.id)
      .update({
      status: "SUCCESS"
    });

    const planMap = {
      "Explorer Plan": "free",
      "Standard Plan": "standard",
      "Unlimited Plan": "unlimited",
    };

    //save to tmpSubscriptions for functions to kick in
    await db.collection("tmpSubscriptions").add({
        plan: planMap[paymentData.plan.name],
        userId: payment.userId,
    })
  }

  return res.status(200);
});