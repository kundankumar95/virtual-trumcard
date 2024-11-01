
import { useState } from 'react';
import './AddProduct.css';
import upload_area from '../../assets/upload_image.png';

const AddProduct = () => {
  const [image, setImage] = useState(null);
  const [productDetails, setProductDetails] = useState({
    name: "",
    category: "cards",
    price: "",
    rating: "",
    AGR: "",
    APPS: "",
    GA_TW_SV: "GA",
    value: "",
  });

  // Handle file input for the image
  const imageHandler = (e) => {
    const file = e.target.files[0];
    setImage(file);
  };

  // Handle text inputs
  const changeHandler = (e) => {
    setProductDetails({ ...productDetails, [e.target.name]: e.target.value });
  };

  // Upload image and return the image URL
  const uploadImage = async (file) => {
    try {
      let formData = new FormData();
      console.log("Hello world");
      formData.append('image', file);

      // console.log(formData);
      const response = await fetch('http://localhost:4000/api/uploadthing', {
        method: 'POST',
        body: formData,
      });

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || 'Image upload failed');
      }

      return responseData.image_url; // Return the image URL
    } catch (error) {
      console.error('Image Upload Error:', error);
      alert('Failed to upload image. Check console for details.');
      return null;
    }
  };

  // Submit product and image
  const addProduct =  (e) => {
    
    e.preventDefault();
    console.log("hii");
    try {
      // Basic validation
      console.log("Hello World");
      const { name, price, rating, AGR, APPS, value } = productDetails;
      if (!name || !price || !rating || !AGR || !APPS || !value) {
        alert('Please fill out all fields.');
        return;
      }
      if (!image) {
        alert('Please upload an image.');
        return;
      }
      console.log(productDetails);
      // Upload image and get the URL
      // const imageUrl =  uploadImage(image);
      // if (!imageUrl) return; // If image upload fails, stop execution

      // Proceed to add the product
      let response =  fetch('http://localhost:4000/addproduct', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...productDetails,
          image: "" // Use the uploaded image URL
        }),
      });

      const responseData =  response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to add product');
      }

      alert(responseData.success ? 'Card Added' : 'Failed to add product');
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Check console for details.');
    }
  };
  
  const [publicId, setPublicId] = useState("");
  // Replace with your own cloud name
  const [cloudName] = useState("hzxyensd5");
  // Replace with your own upload preset
  const [uploadPreset] = useState("aoh4fpwm");

  const [uwConfig] = useState({
    cloudName,
    uploadPreset
  });

  // Create a Cloudinary instance and set your cloud name.
  const cld = new Cloudinary({
    cloud: {
      cloudName
    }
  });

  return (
    <form  encType="multipart/form-data" onSubmit={addProduct} className="addproduct">
      <div className="addproduct-itemfield">
        <p>Card title</p>
        <input 
          value={productDetails.name} 
          onChange={changeHandler} 
          type="text" 
          name='name' 
          placeholder='Type Here' 
          required
        />
      </div>
      <div className="addproduct-price">
        <div className="addproduct-itemfield">
          <p>Price</p>
          <input 
            value={productDetails.price} 
            onChange={changeHandler} 
            type="text" 
            name="price" 
            placeholder='Type Here' 
            required
          />
        </div>
        <div className="addproduct-itemfield">
          <p>Rating</p>
          <input 
            value={productDetails.rating} 
            onChange={changeHandler} 
            type="text" 
            name="rating" 
            placeholder='Type Here' 
            required
          />
        </div>
        <div className="addproduct-itemfield">
          <p>AGR</p>
          <input 
            value={productDetails.AGR} 
            onChange={changeHandler} 
            type="text" 
            name="AGR" 
            placeholder='Type Here' 
            required
          />
        </div>
        <div className="addproduct-itemfield">
          <p>APPS</p>
          <input 
            value={productDetails.APPS} 
            onChange={changeHandler} 
            type="text" 
            name="APPS" 
            placeholder='Type Here' 
            required
          />
        </div>
        <div className="addproduct-itemfield">
          <p>Select any one</p>
          <select 
            value={productDetails.GA_TW_SV} 
            onChange={changeHandler} 
            name='GA_TW_SV' 
            className='add-product-selector'
          >
            <option value="GA">G/A</option>
            <option value="TW">TW</option>
            <option value="SV">SV</option>
          </select>
        </div>
        <div className="addproduct-itemfield">
          <p>Value</p>
          <input 
            value={productDetails.value} 
            onChange={changeHandler} 
            type="text" 
            name="value" 
            placeholder='Type Here' 
            required
          />
        </div>
      </div>
      <div className="addproduct-itemfield">
        <p>Product Category</p>
        <select 
          value={productDetails.category} 
          onChange={changeHandler} 
          name='category' 
          className='add-product-selector'
        >
          <option value="card">Cards</option>
        </select>
      </div>
      <div className="addproduct-itemfield">
        {/* <label htmlFor="file-input">
          <img 
            src={image ? URL.createObjectURL(image) : upload_area} 
            className='addproduct-thumbnail' 
            alt="Upload Area" 
          />
        </label>
        <input 
          onChange={imageHandler} 
          type="file" 
          name='image' 
          id='file-input' 
          hidden 
        /> */}
        <CloudinaryUploadWidget uwConfig={uwConfig} setPublicId={setPublicId} />
      </div>
      <button 
        className='addproduct-btn'
      >
        ADD
      </button>
    </form>
  );
};

export default AddProduct;
