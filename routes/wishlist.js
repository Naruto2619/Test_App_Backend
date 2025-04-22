import express from 'express';
import dotenv from 'dotenv';
import syncRegIDFunctions from '../syncRegID.js';
const { GenerateRegID, SyncRegIDWithEmail } = syncRegIDFunctions;
import WishlistLogic from '../wishlist-logic.js';
const { fetchWishList,CreateSwymList, UpdateSwymList , MarkListPublic, ShareWishlistViaMail} = WishlistLogic;
dotenv.config();
const router = express.Router();


// Add item to wishlist endpoint
router.post('/updateWishlist', async (req, res) => {
  const itemData = {
    epi: req.body.epi, 
    empi: req.body.empi, 
    du: req.body.du,
    sessionid: req.body.sessionID,
    regid: req.body.regID,
    wishlistid: req.body.wishlistID, 
    action: req.body.action,
  };


  try {
    var response = await UpdateSwymList([itemData]);
    console.log(response)
    res.status(200).send({ success: response.success })
  } catch (error) {
    console.error('Error adding item to wishlist:', error.message);
    res.status(500).send(response)
  }
});

router.post('/shareWishlist', async (req, res) => {
  const listData = {
    sessionid: req.body.sessionid,
    regid: req.body.regid,
    wishlistid: req.body.wishlistid, 
    toemail : req.body.toemail,
    fromname : req.body.fromname,
  };

  try {
    var response = await MarkListPublic(listData);
    if(!response.success) {
      res.status(500).send(response)
      return;
    }
    else{
      var response = await ShareWishlistViaMail(listData);
      res.status(200).send({ success: response.success });
    }
  } catch (error) {
    console.error('Error adding item to wishlist:', error.message);
    res.status(500).send(response)
  }
});

// Fetch wishlist endpoint
router.post('/getWishlist', async (req, res) => {
  var parsedProductList = [];
try {
  var wishlist = await fetchWishList(req.body.regID, req.body.sessionID, req.body.wishlistID);
  var productData = wishlist.items;
  for(let i = 0; i < productData.length; i++) {

    // productdata must be indexed by product id
    const parsedProduct = {
      id: productData[i].empi,
      title: productData[i].dt,
      vendor: productData[i].bt,
      url: productData[i].du,
      variantid: productData[i].epi,
      price: parseFloat(productData[i].pr),
      image: {
        src: productData[i].iu,
        alt: productData[i].title,
        width: 300,
        height: 300
      }
    };
    parsedProductList.push(parsedProduct);
  }
  res.json({items : parsedProductList})
} catch (error) {
  console.error('Error fetching wishlist data:', error);
  res.status(500).send('Error loading wishlist');
}
});


// Generate a regID and create a wishlist for the user.
router.post('/postUserData', async(req, res) => {
  try {
      var genreg = await GenerateRegID(req.body.useremail, req.body.useragenttype);
      var wishlist = await CreateSwymList(genreg.sessionID, genreg.regID);
      res.status(200).send(JSON.stringify({ regID: genreg.regID, sessionID: genreg.sessionID, wishlistID: wishlist.lid }));
  } catch (error) {
    console.error('Error generating regid:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to generate regid' });
  }
});


// Sync the regID with the email of the user.
router.post('/guestUserSync', async (req, res) => {
    try {
      const { regid, useremail, useragenttype, sessionid, wishlistid } = req.body;
      // Call Swym's sync API
      const response  =  await SyncRegIDWithEmail(useremail, regid, useragenttype, sessionid, wishlistid);
        console.log("response", response);
        res.status(200).send(response);
    } catch (error) {
      console.error('Error syncing regID with email:', error.message);
      res.status(500).json({ success: false, error: error.message });
    }
  });


export default router;