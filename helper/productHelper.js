const Product = require('../models/productModel');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');



const addProduct = (data, files) => {

    console.log("> inside the productHelper addproduct <");

    // const { hiddenField1, hiddenField2, hiddenField3, hiddenField4, } = data;
    console.log("> hello... < data: ",data);
  
    return new Promise(async (resolve, reject) => {
      console.log("> inside the productHelper_addProduct | data: <", data);
     
      let images=[]
      for(const file of files){
          images.push(file.filename)
          
          console.log(files);
      }


      const productQuantity = 
      {
            s:{
               quantity:data.small,
          },
          m:
          {
              quantity:data.medium,
              },
          l:
          {
               quantity:data.large,
              },
      }

      let totalQuantity =
        parseInt(data.small) +
        parseInt(data.medium) +
        parseInt(data.large);
      
      console.log("prdcthlpr | data.category :",data.category);
       const newProduct =await Product.create({

          name: data.name,
          description: data.description,
          category: data.category,
          price: {
            salesPrice:data.salesPrice,
          },
          size: productQuantity,
        //   productDiscount: data.discount,
        //   totalQuantity: totalQuantity,
          image: images,
        })

        // const newProduct = await productModel.create(productAdding);
  
        // Array to store promises for cropping operations
        const cropPromises = [];
  
        // Define cropImage function
        async function cropImage(hiddenfield) {
            return new Promise((resolve, reject) => {
                let parts = hiddenfield.split(" ");
                let ind = parseInt(parts[1]);
                let x = parseInt(parts[3]);
                let y = parseInt(parts[5]);
                let width = parseInt(parts[7]);
                let height = parseInt(parts[9]);
        
                let filename = newProduct.image[ind];
                let inputPath = path.join(__dirname, `../uploads/${filename}`);
                let outputPath = path.join(__dirname, `../uploads/cropped_${filename}`);
        
                sharp(inputPath)
                    .extract({ left: x, top: y, width: width, height: height })
                    .toFile(outputPath, (err) => {
                        if (err) {
                            console.error("Error cropping image:", err);
                            reject(err);
                        } else {
                            // Update the product image path with the cropped image
                            let croppedFilename = `cropped_${filename}`;
                            newProduct.image[ind] = croppedFilename;
        
                            // try {
                            //     // Attempt to unlink the file
                            //     fs.unlinkSync(inputPath);
                            //     console.log('File unlinked successfully');
                            // } catch (err) {
                            //     // Handle the error
                            //     console.error('Error unlinking file:', err);
                            //     // You can take further action here, such as retrying or notifying the user
                            // }
                            // // Resolve the promise
                            resolve();
                        }
                    });
            });
        }


    //     // Push crop promises to array
    //   if (hiddenField1) {
    //     cropPromises.push(cropImage(hiddenField1));
    // }
    // if (hiddenField2) {
    //     cropPromises.push(cropImage(hiddenField2));
    // }
    // if (hiddenField3) {
    //     cropPromises.push(cropImage(hiddenField3));
    // }
    // if (hiddenField4) {
    //     cropPromises.push(cropImage(hiddenField4));
    // }
   
    

    // Wait for all crop promises to resolve
    await Promise.all(cropPromises);

    // Save the updated product after all cropping operations
    await newProduct.save();

    const message = "Product added successfully";
    resolve(true)
        
    })
      
}

module.exports = {
    addProduct,

}