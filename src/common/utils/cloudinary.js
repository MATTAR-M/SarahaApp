import { v2 as cloudinary } from 'cloudinary'
import { API_SEC } from '../../../config/config.service.js';
cloudinary.config({ 
    cloud_name: 'dqrzkmymm', 
    api_key: '496793267396531', 
    api_secret: `${API_SEC}`
});


export default cloudinary