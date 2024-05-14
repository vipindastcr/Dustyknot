const Category = require('../models/categoryModel');


    const displayAddCategory = async (req,res) => {
        try {
            const category = await Category.find({});
            res.render('categories',{category});

        } catch (error) {
            console.log(error.message);
        }
    }


const postAddCategories = async(req,res) => {
    try {
            // const category = await Category.find({})
            const category = await Category.find({});
            console.log("it's here!! add category");
            const { name,description } = req.body;
            // console.log("req.body>>> "+req.body);
            // console.log(">>>"+req.body.name+"<<<");

            const categoryExists = await Category.findOne({name:name});
            console.log("categoryExists >>> "+categoryExists);

            if(categoryExists) {    
                res.render('categories',{ category,message:"category already exist"})
            }
            else {
                const category = new Category({
                    name:name,
                    description:description,
                    isActive:true,
                })

                const categoryData =await category.save()
                if(categoryData) {
                    const category = await Category.find({});
                    res.render('categories',{categoryData,category})
                }else{
                    const category = await Category.find({});
                    res.render('categories',{categoryData,category})
                }
            }
    } catch (error) {
        console.log(error.message);
    }   
}


const editCategory = async(req,res) => {
    try {
        const cid = req.query._id;
        console.log(cid);
        const category = await Category.findOne({_id:cid});
        res.render('editCategory',{category})

    } catch (error) {
        console.log(error.message);
    }
}


const postEditCategory = async (req, res) => {
    try {
        const categoryId = req.body._id;
        const { name, description } = req.body;
        let category = await Category.findOne({ _id: categoryId });
        const catname = name.trim();

        if (catname !== category.name) {
            const ucat = await Category.findOne({ name: catname });

            if (!ucat) {
                category = await Category.findOneAndUpdate({ _id: categoryId }, { $set: { name: catname, description: description } });
                res.redirect("/categories");
            } else {
                res.render('editCategory', { category, message: "Category already exists" });
            }
        } else {
            category = await Category.findOneAndUpdate({ _id: categoryId }, { $set: { name: catname, description: description } });
            res.redirect('/categories');
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};

const blockCategory = async (req,res) => {
    try {
        console.log("blockCategory function reached" +req.body.id);
        const id = req.body.id;
        console.log("category id"+id);
        const category = await Category.findById({_id:id})
        
        if(category.isActive == true) {
            await Category.findByIdAndUpdate({_id:id},{$set:{isActive:false}})
        }else {
            await Category.findByIdAndUpdate({_id:id},{$set:{isActive:true}})
        }

        res.json({success:true})
    } catch (error) {
        console.log(error.message);
    }
}



module.exports = {
    displayAddCategory,
    postAddCategories,
    editCategory,
    postEditCategory,
    blockCategory
}