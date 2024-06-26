const Product = require('../models/productModel');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');



const addProduct = (data, files) => {
  
    return new Promise(async (resolve, reject) => {
     
      let images=[]
      for(const file of files){
          images.push(file.filename)
      }

      let totalQuantity =
      parseInt(data.small) +
      parseInt(data.medium) +
      parseInt(data.large);

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
      
       const newProduct =await Product.create({

          name: data.name,
          description: data.description,
          category: data.category,
          price: {
            salesPrice:data.salesPrice,
          },
          size: productQuantity,
          totalQuantity: totalQuantity,
          image: images,
        })

        const cropPromises = [];
  
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
                            let croppedFilename = `cropped_${filename}`;
                            newProduct.image[ind] = croppedFilename;
                            resolve();
                        }
                    });
            });
        }
    
    await Promise.all(cropPromises);
    await newProduct.save();

    const message = "Product added successfully";
    resolve(true)
        
    })
      
}



const getAllProducts =() => {

    return new Promise(async(resolve,reject) => {

        const product = await Product

        .aggregate([
            {
                $lookup: {
                    from: "categories",
                    localField: "caotegory",
                    foreignField: "_id",
                    as: "category"
                }
            }
        ])

        .then ((result) => {
            resolve(result)
        })

        .catch((error) => {
            console.log(error);
        })
    })
}

module.exports = {
    addProduct,
    getAllProducts
}