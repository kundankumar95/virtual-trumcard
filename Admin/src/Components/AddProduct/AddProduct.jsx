import  { useState } from 'react';
import './AddProduct.css';

const AddProduct = () => {
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
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

  const changeHandler = (e) => {
    setProductDetails({ ...productDetails, [e.target.name]: e.target.value });
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0]; 
    if (file) {
      setImageFile(file);
      const imageUrl = URL.createObjectURL(file); 
      setImageUrl(imageUrl);
    }
  };

  const handleImageUpload = async () => {
    if (!imageFile) {
      alert('Please select an image first!');
      return;
    }

    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('upload_preset', 'aoh4fpwm'); 

    try {
      const response = await fetch('https://api.cloudinary.com/v1_1/hzxyensd5/image/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        setImageUrl(data.secure_url); 
        alert('Image uploaded successfully!');
      } else {
        throw new Error(data.message || 'Image upload failed');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image. Check console for details.');
    }
  };

  const addProduct = async (e) => {
    e.preventDefault();

    const { name, price, rating, AGR, APPS, value } = productDetails;
    if (!name || !price || !rating || !AGR || !APPS || !value) {
      alert('Please fill out all fields.');
      return;
    }
    if (!imageUrl) {
      alert('Please upload an image.');
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/addproduct', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...productDetails,
          image: imageUrl, 
        }),
      });

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to add product');
      }

      alert(responseData.success ? 'Product added successfully' : 'Failed to add product');
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Check console for details.');
    }
  };

  return (
    <form encType="multipart/form-data" onSubmit={addProduct} className="addproduct">
      <div className="addproduct-itemfield">
        <p>Card title</p>
        <input
          value={productDetails.name}
          onChange={changeHandler}
          type="text"
          name="name"
          placeholder="Type Here"
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
            placeholder="Type Here"
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
            placeholder="Type Here"
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
            placeholder="Type Here"
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
            placeholder="Type Here"
            required
          />
        </div>
        <div className="addproduct-itemfield">
          <p>Select any one</p>
          <select
            value={productDetails.GA_TW_SV}
            onChange={changeHandler}
            name="GA_TW_SV"
            className="add-product-selector"
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
            placeholder="Type Here"
            required
          />
        </div>
      </div>
      <div className="addproduct-itemfield">
        <p>Product Category</p>
        <select
          value={productDetails.category}
          onChange={changeHandler}
          name="category"
          className="add-product-selector"
        >
          <option value="card">Cards</option>
        </select>
      </div>

      <div className="addproduct-itemfield">
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleImageSelect} 
          className="upload-input"
        />
        
        {imageUrl && (
          <div className="image-thumbnail">
            <img src={imageUrl} alt="Selected" className="uploaded-image" />
          </div>
        )}
      </div>

      <button type="button" onClick={handleImageUpload} className="upload-btn">
        Upload Image
      </button>
      <button className="addproduct-btn">ADD</button>
    </form>
  );
};

export default AddProduct;
