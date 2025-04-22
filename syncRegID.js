import axios from 'axios';
import dotenv from 'dotenv'; 
import { v4 as uuidv4 } from 'uuid';
import WishlistLogic from './wishlist-logic.js';
const { fetchWishList, UpdateSwymList} = WishlistLogic;

dotenv.config();

const SYNCREGIDURL = `${process.env.SWYM_API_ENDPOINT}/storeadmin/v3/user/guest-validate-sync`;
const FETCHLISTURL = `${process.env.SWYM_API_ENDPOINT}/api/v3/lists/fetch-lists?pid=${encodeURIComponent(process.env.SWYM_PID)}`;
const REGIDURL = `${process.env.SWYM_API_ENDPOINT}/storeadmin/v3/user/generate-regid`;

export async function GenerateRegID(useremail, useragenttype) {
    const {regID,sessionID} = await genRegIDWithSwymAPI(useremail, useragenttype);
    return {"regID" : regID,"sessionID" : sessionID};
}

export async function SyncRegIDWithEmail(useremail, regid, useragenttype,sessionid,lid) {
    const getAnonWishList = await fetchWishList(regid,sessionid,lid);
    const message = await syncRegIDWithEmailWithSwymAPI(useremail, regid, useragenttype);
    var newRegID = message.regid;
    const getUserList = await checkIfUserAlreadyHasWishList(sessionid,newRegID);
    var finalResponseBody = {
      regid: message.regid,
      lid: getUserList.length > 0 ? getUserList[0].lid : null,
    }
    console.log("finalResponseBody",finalResponseBody);
    try{
      var transferWishlist = [];
      getAnonWishList.items.forEach((item) => {
        transferWishlist.push({
          epi: item.epi,
          empi: item.empi,
          du: item.du,
          sessionid: sessionid,
          regid: finalResponseBody.regid,
          wishlistid: finalResponseBody.lid,
          action: 'add',
        });
      });
      var updateResponse = await UpdateSwymList(transferWishlist);
      if (updateResponse.success) {
        finalResponseBody = {
          ...finalResponseBody,
          success: true,
        };
      } else {
        finalResponseBody = {
          ...finalResponseBody,
          success: false,
        };
      }
    }catch(e){
      console.error(JSON.stringify(e.response?.data || e.message));
    }

    return finalResponseBody;
}

export async function syncRegIDWithEmailWithSwymAPI(useremail, regid, useragenttype) {
    const swymConfig = {
        pid: process.env.SWYM_PID,
        accessToken: process.env.SWYM_API_KEY,
    };

    const config = getRequestConfig(swymConfig.pid, swymConfig.accessToken, useragenttype);
    attachUserUniqueIdentifier(useremail, config.body);
    config.body.append('regid', regid);

    try {
        const res = await axios.post(SYNCREGIDURL, config.body, {
            headers: config.headers,
        });
        console.log(res.data);
        return res.data;
    } catch (e) {
        console.error(JSON.stringify(e.response?.data || e.message));
        return { error: true };
    }
}

async function checkIfUserAlreadyHasWishList(sessionid, regid) {
  const requestBody = new URLSearchParams();
  requestBody.append('regid', regid); 
  requestBody.append('sessionid', sessionid); 
  try {
      const res = await axios.post(FETCHLISTURL, requestBody, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
          'user-agent': 'desktopApp', 
        },
      });
      return res.data;
  } catch (e) {
      console.error(JSON.stringify(e.response?.data || e.message));
      return { error: true };
  }
}

//Handles only logged in users ie when email is known
function attachUserUniqueIdentifier(useremail, urlencoded) {
    if (useremail != null && useremail !== 'undefined' && useremail !== undefined) {
       urlencoded.append('useremail', useremail);
     } else {
       urlencoded.append('uuid', uuidv4());
     }
}

async function genRegIDWithSwymAPI(useremail,useragenttype) {
    const swymConfig = {
        pid: process.env.SWYM_PID,
        accessToken: process.env.SWYM_API_KEY,
    };

  const config = getRequestConfig(swymConfig.pid, swymConfig.accessToken, useragenttype);
  attachUserUniqueIdentifier(useremail, config.body);
  
  try {
    const res = await axios.post(REGIDURL, config.body, {
      headers: config.headers,
    });
    // Return the response data if the request is successful
    return { regID: res.data.regid, sessionID: res.data.sessionid};
  } catch (e) {
    console.error(JSON.stringify(e.response?.data || e.message));
    return { error: true };
  }
}

function getRequestConfig(pid, accessToken, useragenttype ) {
    const urlencoded = new URLSearchParams();
    urlencoded.append('useragenttype', useragenttype);

    const config = {
      method: 'post',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${pid}:${accessToken}`).toString('base64')}`,
      },
      redirect: 'follow',
      body: urlencoded,
    };
    return config;
}

export default {
    GenerateRegID,
    SyncRegIDWithEmail,
};