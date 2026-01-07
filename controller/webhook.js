
import crypto from "crypto"
import crc32 from "buffer-crc32"
 
import fs from "fs/promises"
import fetch from "node-fetch"
import { generatePaypalToken } from "../middleware/Authorization"
import User from "../model/user"
import mongoose from "mongoose"
import axios from "axios";


async function downloadAndCache(url, cacheKey) {
    if(!cacheKey) {
      cacheKey = url.replace(/\W+/g, '-')
    }
    let CACHE_DIR = "."
    const filePath = `${CACHE_DIR}/${cacheKey}`;
   
    // Check if cached file exists
    const cachedData = await fs.readFile(filePath, 'utf-8').catch(() => null);
    if (cachedData) {
      return cachedData;
    }
   
    // Download the file if not cached
    const response = await fetch(url);
    const data = await response.text()
    await fs.writeFile(filePath, data);
   
    return data;
  }
export const wehook = async (request, response) => {
    try {
      const headers = request.headers;
      const event = request.body;

      const isSignatureValid = await verifySignature(event, headers);
     
      if (isSignatureValid) {
        console.log('Signature is valid.');

        switch(event.event_type){
case "CUSTOMER.MERCHANT-INTEGRATION.SELLER-CONSENT-GRANTED":
    await generatePaypalToken(async (token) => {
        const fetch = await User.findOne({ _id: mongoose.Types.ObjectId(event?.resource?.merchant_id) });
         if(fetch){

            for (let data of fetch.gatewayPlatform) {
                if (data.type == "Paypal") {
                  axios
                    .get(
                      `${config.PaypalUrl}/v1/customer/partners/${data.partner_id}/merchant-integrations/${data.account_id}`,
                      {
                        headers: {
                          "paypal-partner-attribution-id": "GOTIPME_SP_PPCP",
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${token.access_token}`,
                        },
                      }
                    )
                    .then(async (resp) => {
                      if (resp.data.primary_email_confirmed && resp.data.payments_receivable) {
                        await User.updateMany(
                            {
                              _id: mongoose.Types.ObjectId(event?.resource?.merchant_id),
                              "gatewayPlatform.type": "Paypal",
                            },
                            {
                              $set: {
                                "gatewayPlatform.$.status": "Active",
                              },
                            }
                          );
                      } 
                    })
                    .catch((err) => {
                      console.log(
                        "sadsad",
                        err.message,
                        `${config.PaypalUrl}/v1/customer/partners/${data.partner_id}/merchant-integrations/${merchantIdInPayPal}`
                      );
                    });
                }
              }



         }

      
      });

case "CUSTOMER.MERCHANT-INTEGRATION.SELLER-EMAIL-CONFIRMED":
    await generatePaypalToken(async (token) => {
        const fetch = await User.findOne({ _id: mongoose.Types.ObjectId(event?.resource?.merchant_id) });
         if(fetch){

            for (let data of fetch.gatewayPlatform) {
                if (data.type == "Paypal") {
                  axios
                    .get(
                      `${config.PaypalUrl}/v1/customer/partners/${data.partner_id}/merchant-integrations/${data.account_id}`,
                      {
                        headers: {
                          "paypal-partner-attribution-id": "GOTIPME_SP_PPCP",
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${token.access_token}`,
                        },
                      }
                    )
                    .then(async (resp) => {
                      if (resp.data.primary_email_confirmed && resp.data.payments_receivable) {
                        await User.updateMany(
                            {
                              _id: mongoose.Types.ObjectId(event?.resource?.merchant_id),
                              "gatewayPlatform.type": "Paypal",
                            },
                            {
                              $set: {
                                "gatewayPlatform.$.status": "Active",
                              },
                            }
                          );
                      } 
                    })
                    .catch((err) => {
                      console.log(
                        "sadsad",
                        err.message,
                        `${config.PaypalUrl}/v1/customer/partners/${data.partner_id}/merchant-integrations/${merchantIdInPayPal}`
                      );
                    });
                }
              }



         }

      
      });
    default : console.log("No Event")
    

        }
     
     
      } else {
        console.log(`Signature is not valid for ${event?.id} ${headers?.['correlation-id']}`);
        // Reject processing the webhook event. May wish to log all headers+data for debug purposes.
      }
     
    //   Return a 200 response to mark successful webhook delivery
      response.sendStatus(200);
    //   res.status(202).json(true);
    } catch (error) {
        console.log("asdasda" , error.message)
        response.status(202).json(false);
    }
  };
   

  async function verifySignature(event, headers) {
    let WEBHOOK_ID = "8KX56343ST352341G"
    const transmissionId = headers['paypal-transmission-id']
    const timeStamp = headers['paypal-transmission-time']
    
    const crc = parseInt("0x" + crc32(JSON.stringify(event) ).toString('hex')); // hex crc32 of raw event data, parsed to decimal form
 
    const message = `${transmissionId}|${timeStamp}|${WEBHOOK_ID}|${crc}`
  
    const certPem = await downloadAndCache(headers['paypal-cert-url']);
   
    // Create buffer from base64-encoded signature
    const signatureBuffer = Buffer.from(headers['paypal-transmission-sig'], 'base64');
   
    // Create a verification object
    const verifier = crypto.createVerify('SHA256');
   
    // Add the original message to the verifier
    verifier.update(message);
   
    return verifier.verify(certPem, signatureBuffer);
  }
   