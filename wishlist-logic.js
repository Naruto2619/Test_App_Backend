import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();
const SWYM_PID = process.env.SWYM_PID;
const SWYM_BASE_URL = process.env.SWYM_API_ENDPOINT;
const SHOPIFY_DOMAIN = process.env.SHOPIFY_DOMAIN;


/// Function to create a Swym list
/// @param {string} sessionId - The session ID for the user
/// @param {string} regid - The registration ID for the user
async function CreateSwymList(sessionId, regid) {
  try {

    const url = `${SWYM_BASE_URL}/api/v3/lists/create?pid=${encodeURIComponent(SWYM_PID)}`;

    const requestBody = new URLSearchParams({
      lname: "wishlist", 
      sessionid: sessionId, 
      regid: regid, 
    });

    // Make the POST request
    const response = await axios.post(url, requestBody, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
        'user-agent': 'desktopApp', 
      },
    });

    console.log('List created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating list:', error.response?.data || error.message);
    throw error;
  }
}


/// Function to fetch a Swym list with its contents
/// @param {string} regid - The registration ID for the user
/// @param {string} sessionid - The session ID for the user
/// @param {string} lid - The list ID to fetch
async function fetchWishList(regid,sessionid,lid){
  const url = `${SWYM_BASE_URL}/api/v3/lists/fetch-list-with-contents?pid=${encodeURIComponent(SWYM_PID)}`;
  try{
      const requestBody = new URLSearchParams();
      requestBody.append('regid', regid); 
      requestBody.append('sessionid', sessionid); 
      requestBody.append('lid', lid); 
      console.log(lid,sessionid,regid);
      // Make the POST request
      const response = await axios.post(url, requestBody, {
          headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
          'user-agent': 'desktopApp',
          },
      });
      console.log('List fetched successfully:', response.data);
      return response.data;
  } catch (error) {
    console.error('Error fetching list:', error.response?.data || error.message);
    throw error;
  }
}

/// Function to update a Swym list with an item
/// @param {Object} itemData - The data of the item to be added or removed
async function UpdateSwymList(itemData) {
  const url = `${SWYM_BASE_URL}/api/v3/lists/update-ctx?pid=${encodeURIComponent(SWYM_PID)}`;
  try {
    var action;
    switch (itemData[0].action) {
      case 'add':
        action = 'a';
        break;
      case 'remove':
        action = 'd';
        break;
      case 'update':
        action = 'u';
        break;
      default:
        throw new Error('Invalid action specified');
    }
    var dataList = []
    itemData.forEach(element => {
      var productURL;
      if(element.du.includes("https://")) {
        productURL = element.du;
      }else{
        productURL = "https://"+ SHOPIFY_DOMAIN+element.du;
      }
      dataList.push(`{ "epi": "${element.epi}", "empi": "${element.empi}", "du": "${productURL}" }`)
    });
    const requestBody = new URLSearchParams();
    requestBody.append('regid', itemData[0].regid); 
    requestBody.append('sessionid', itemData[0].sessionid); 
    requestBody.append('lid', itemData[0].wishlistid); 
    console.log(`[${dataList.toString()}]`);
    requestBody.append(action, `[${dataList.toString()}]`); // Add item data
    
    
    const response = await axios.post(url, requestBody, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
        'user-agent': 'desktopApp', 
      },
    });

    console.log('\nItem updated successfully:', response.data);
    return { success: true, response: response.data };
  } catch (error) {
    console.error('Error updating item to list:', error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
}

async function MarkListPublic(itemData) {
  try {
    const url = `${SWYM_BASE_URL}/api/v3/lists/markPublic?pid=${encodeURIComponent(SWYM_PID)}`;
    console.log(itemData);
    const requestBody = new URLSearchParams();
    requestBody.append('regid', itemData.regid); 
    requestBody.append('sessionid', itemData.sessionid); 
    requestBody.append('lid', itemData.wishlistid); 

    const response = await axios.post(url, requestBody, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
        'user-agent': 'desktopApp', 
      },
    });
    
    return { success: true, response: response.data };
  } catch (error) {
    console.error('Error marking list public:', error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
}

async function ShareWishlistViaMail(itemData) {
  try {
    const url = `${SWYM_BASE_URL}/api/v3/lists/emailList?pid=${encodeURIComponent(SWYM_PID)}`;

    const requestBody = new URLSearchParams();
    requestBody.append('regid', itemData.regid); 
    requestBody.append('sessionid', itemData.sessionid); 
    requestBody.append('lid', itemData.wishlistid); 
    requestBody.append('fromname', itemData.fromname);
    requestBody.append('toemail', itemData.toemail);

    const response = await axios.post(url, requestBody, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
        'user-agent': 'desktopApp', 
      },
    });
    
    return { success: true, response: response.data };
  } catch (error) {
    console.error('Error marking list public:', error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
}


export default {
    CreateSwymList,
    UpdateSwymList,
    fetchWishList,
    MarkListPublic,
    ShareWishlistViaMail
}
