import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Button, Form } from 'react-bootstrap';
import "bootstrap/dist/css/bootstrap.min.css";
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';
import Cookies from 'js-cookie';
import Sidebar from '../Customer/Sidebar';
import { useNavigate, useLocation } from 'react-router-dom';
import { decryptData } from "../Encrypt/encryptionUtils";

const Address = () => {
  const location = useLocation();
  const editMode = location.state?.editMode;
  const editData = location.state?.addressData;
  
  const userId = decryptData(Cookies.get("UserId"));
  const [address, setAddress] = useState({
    AddressID: editData?.AddressID || '',
    AccountID: userId,
    AddressStatus: editData?.AddressStatus || 1,
    wardCode: editData?.wardCode || '',
    districtCode: editData?.districtCode || '',
    provinceCode: editData?.provinceCode || '',
    AddressDetail: editData?.AddressDetail || '',
    phoneNumber: editData?.phoneNumber || '',
  });

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [isPhoneChecking, setIsPhoneChecking] = useState(false);
  const [isPhoneAvailable, setIsPhoneAvailable] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await axios.get('https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/province', {
          headers: { 'Token': '780e97f0-7ffa-11ef-8e53-0a00184fe694' }
        });
        setProvinces(response.data.data || []);
      } catch (error) {
        console.error('Error fetching provinces:', error);
        showAlert('error', 'Không thể tải danh sách tỉnh thành.');
      }
    };

    fetchProvinces();
  }, []);

  useEffect(() => {
    if (editMode && editData?.provinceCode) {
      fetchDistricts(editData.provinceCode);
      if (editData.districtCode) {
        fetchWards(editData.districtCode);
      }
    }
  }, [editMode, editData]);

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      if (address.phoneNumber.length >= 10) {
        handlephoneNumberCheck();
      }
    }, 500); 

    return () => clearTimeout(debounceTimeout);
  }, [address.phoneNumber]);

  useEffect(() => {
    let timer;
    if (otpTimer > 0) {
      timer = setInterval(() => {
        setOtpTimer((prevTime) => prevTime - 1);
      }, 1000);
    } else if (otpTimer === 0 && otpSent) {
      setOtpSent(false);
      setOtpCode('');
      showAlert('error', 'OTP expired. Please request a new one.');
    }
    
    return () => clearInterval(timer);
  }, [otpTimer, otpSent]);

  const fetchDistricts = async (provinceId) => {
    try {
      setDistricts([]);
      setWards([]);
      setAddress((prev) => ({ ...prev, districtCode: '', wardCode: '' }));

      const response = await axios.post(
        'https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/district',
        { province_id: Number(provinceId) },
        { headers: { 'Token': '780e97f0-7ffa-11ef-8e53-0a00184fe694' } }
      );
      setDistricts(response.data.data || []);
    } catch (error) {
      console.error('Error fetching districts:', error);
      showAlert('error', 'Không thể tải danh sách quận huyện.');
    }
  };

  const fetchWards = async (districtId) => {
    try {
      setWards([]);
      setAddress((prev) => ({ ...prev, wardCode: '' }));

      const response = await axios.post(
        'https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/ward',
        { district_id: Number(districtId) },
        { headers: { 'Token': '780e97f0-7ffa-11ef-8e53-0a00184fe694' } }
      );
      setWards(response.data.data || []);
    } catch (error) {
      console.error('Error fetching wards:', error);
      showAlert('error', 'Không thể tải danh sách phường xã.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const formatPhoneNumber = (number) => {
    // Remove any non-digit characters and the '+' symbol
    let cleaned = number.replace(/\D/g, '');
    
    // Remove '84' prefix if it exists
    if (cleaned.startsWith('84')) {
      cleaned = cleaned.slice(2);
    }
    
    // Remove leading '0' if it exists
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.slice(1);
    }
    
    // Ensure the number doesn't exceed 9 digits (after removing prefix)
    cleaned = cleaned.slice(0, 9);
    
    // Add '84' prefix for API submission
    return cleaned ? `84${cleaned}` : '';
  };

  const handlephoneNumberChange = (e) => {
    let numericValue = e.target.value.replace(/\D/g, '');
    
    if (numericValue.startsWith('0')) {
      numericValue = '84' + numericValue.slice(1);
    }
  
    setAddress((prev) => ({ ...prev, phoneNumber: numericValue.trim() }));
    setOtpSent(false);
    setOtpCode('');
    setOtpVerified(false);
  };

  const displayPhoneNumber = (number) => {
    if (!number) return '';
    if (number.startsWith('84')) {
      return '0' + number.slice(2);
    }
    return number;
  };

  const checkphoneNumberExists = async (phoneNumber) => {
    try {
      const response = await axios.get(
        `https://rmrbdapi.somee.com/odata/CustomerAddress?$filter=phoneNumber eq '${phoneNumber}'`,
        {
          headers: {
            'Token': '123-abc',
          },
        }
      );
  
      // Log the full response data to confirm structure
      console.log('Full response data:', response.data);
  
      // Check if response data is an array directly
      if (Array.isArray(response.data) && response.data.length > 0) {
        console.log('Phone number found:', response.data);
        return true; // Phone number exists
      } else {
        console.log('No matching phone number found');
        return false; // Phone number does not exist
      }
    } catch (error) {
      console.error('Error checking phone number:', error);
      showAlert('error', 'Lỗi kiểm tra số điện thoại. Vui lòng thử lại.');
      return false; // Return false in case of error
    }
  };
  
const handlephoneNumberCheck = async () => {
  setIsPhoneChecking(true);

  const phoneExists = await checkphoneNumberExists(address.phoneNumber);

  setIsPhoneChecking(false);
  
  if (phoneExists) {
    setIsPhoneAvailable(true); // Phone exists
    showAlert('success', 'Số điện thoại đã tồn tại. Bạn có thể bỏ qua OTP và lưu địa chỉ.');
    setOtpVerified(true); // Skip OTP verification
  } else {
    setIsPhoneAvailable(false); // Phone does not exist
    showAlert('error', 'Số điện thoại chưa tồn tại. Vui lòng gửi OTP để xác thực.');
    setOtpSent(false); // Reset OTP state
    setOtpVerified(false); // Reset OTP verified state
  }
};

const handleSendOtp = async () => {
  if (!address.phoneNumber || address.phoneNumber.length < 10) {
    showAlert('error', 'Vui lòng nhập số điện thoại hợp lệ.');
    return;
  }

  const payload = { phoneNumber: address.phoneNumber };
  console.log("Sending OTP with payload:", payload); // Log the payload

  try {
    const response = await axios.post(
      'https://rmrbdapi.somee.com/odata/SMSSender/send',
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Token': '123-abc',
        },
      }
    );
    console.log("OTP send response:", response.data); // Log the response from OTP sending API

    if (response.status === 200) {
      showAlert('success', 'Đã gửi OTP thành công!');
      setOtpSent(true);
      setOtpTimer(300); 
    } else {
      showAlert('error', 'Không thể gửi OTP.');
    }
  } catch (error) {
    console.error('Error sending OTP:', error);
    showAlert('error', 'Lỗi khi gửi OTP. Vui lòng thử lại.');
  }
};

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length < 6) {
      showAlert('error', 'Vui lòng nhập mã OTP.');
      return;
    }

    try {
      const response = await axios.post(
        'https://rmrbdapi.somee.com/odata/SMSSender/verify',
        { phoneNumber: address.phoneNumber, OTPCode: otpCode },
        {
          headers: {
            'Content-Type': 'application/json',
            'Token': '123-abc',
          },
        }
      );

      if (response.status === 200) {
        showAlert('success', 'Xác thực OTP thành công!');
        setOtpVerified(true);
      } else {
        showAlert('error', 'Xác thực OTP thất bại. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      showAlert('error', `Lỗi xác thực OTP: ${error.message || 'Unknown error'}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Check phone number existence and ensure OTP verification for new numbers
    if (!otpVerified && !(await checkphoneNumberExists(address.phoneNumber))) {
      showAlert('error', 'Vui lòng xác thực OTP trước khi lưu địa chỉ.');
      return;
    }
  
    const addressData = {
      AddressID: address.AddressID || 0,
      AccountID: userId,
      phoneNumber: address.phoneNumber,
      AddressStatus: address.AddressStatus || 1,
      wardCode: address.wardCode,
      districtCode: Number(address.districtCode),
      provinceCode: Number(address.provinceCode),
      AddressDetail: address.AddressDetail,
      BookOrders: [],
      Books: []
    };
  
    try {
      const response = await axios({
        method: address.AddressID ? 'put' : 'post',
        url: address.AddressID 
          ? `https://rmrbdapi.somee.com/odata/CustomerAddress/${address.AddressID}`
          : 'https://rmrbdapi.somee.com/odata/CustomerAddress',
        data: addressData,
        headers: { 'Content-Type': 'application/json', 'Token': '123-abc' }
      });
  
      if (response.status === 200 || response.status === 201) {
        showAlert('success', 'Đã lưu địa chỉ thành công!');
        resetForm();
      } else {
        showAlert('error', 'Lỗi khi lưu địa chỉ. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Error saving address:', error);
      showAlert('error', 'Lỗi khi lưu địa chỉ. Vui lòng thử lại.');
    }
  };

  const resetForm = () => {
    setAddress({
      AddressID: '',
      AccountID: userId,
      AddressStatus: 1,
      wardCode: '',
      districtCode: '',
      provinceCode: '',
      AddressDetail: '',
      phoneNumber: '',
    });
    setOtpSent(false);
    setOtpCode('');
    setOtpVerified(false);
  };

  const showAlert = (icon, text) => {
    Swal.fire({
      icon,
      text,
      toast: false,
      position: 'center',
      showConfirmButton: true,
      timer: 3000,
      timerProgressBar: true,
      customClass: {
        popup: 'swal2-show',
        container: 'swal2-container'
      }
    });
  };

  const pageTitle = editMode ? "Chỉnh Sửa Địa Chỉ" : "Thêm Địa Chỉ Mới";

  useEffect(() => {
    if (editMode && editData?.phoneNumber) {
      setOtpVerified(true);
      setIsPhoneAvailable(true);
    }
  }, [editMode, editData]);

  return (
    <div className="flex flex-col md:flex-row justify-center items-start p-4 space-y-8 md:space-y-0 md:space-x-8">
      <Sidebar />
      
      <div className="flex flex-col">
        <Container className="section-center w-[1140px] bg-white p-4 rounded-lg shadow-md flex flex-col">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Button
                  onClick={() => navigate('/manage-addresses')}
                  className="mr-4 text-orange-500 hover:text-orange-600 bg-transparent border border-orange-500 hover:border-orange-600 px-4 py-2 rounded-lg transition-colors"
                >
                  ← Quay lại
                </Button>
                <h2 className="text-2xl font-semibold text-gray-800">{pageTitle}</h2>
              </div>
            </div>
            
            <Form onSubmit={handleSubmit} className="space-y-6">
              {/* Phone Number Input */}
              <div className="flex gap-4">
                <div className="flex-grow">
                  <Form.Control
                    type="tel"
                    placeholder="Nhập số điện thoại"
                    value={displayPhoneNumber(address.phoneNumber)}
                    onChange={handlephoneNumberChange}
                    className="w-full px-4 py-3 rounded-lg border-2"
                    required
                  />
                </div>
                <div className="flex-shrink-0">
                  {isPhoneChecking ? (
                    <div className="spinner-border" role="status">
                      <span className="visually-hidden">Đang tải...</span>
                    </div>
                  ) : isPhoneAvailable ? null : (
                    <Button 
                      variant="secondary" 
                      onClick={handleSendOtp} 
                      disabled={otpSent || isPhoneChecking}
                      className="px-6 py-2 rounded-lg"
                    >
                      {otpSent ? 'Gửi Lại OTP' : 'Gửi OTP'}
                    </Button>
                  )}
                </div>
              </div>

              {/* OTP Section */}
              <AnimatePresence>
                {otpSent && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4"
                  >
                    <div className="flex gap-4">
                      <Form.Control
                        type="text"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="Nhập mã OTP"
                        maxLength={6}
                        className="flex-grow px-4 py-3 rounded-lg border-2"
                      />
                      <Button
                        variant="success"
                        onClick={handleVerifyOtp}
                        className="px-6 py-2 rounded-lg"
                      >
                        Xác Thực OTP
                      </Button>
                    </div>
                    {otpTimer > 0 && (
                      <div className="text-sm text-gray-500">
                        Mã OTP hết hạn trong {Math.floor(otpTimer / 60)}:{String(otpTimer % 60).padStart(2, '0')}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Location Selection */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Form.Group>
                  <Form.Label>Tỉnh/Thành Phố</Form.Label>
                  <Form.Select
                    name="provinceCode"
                    value={address.provinceCode}
                    onChange={(e) => {
                      handleInputChange(e);
                      fetchDistricts(e.target.value);
                    }}
                    className="w-full px-4 py-3 rounded-lg border-2"
                    required
                  >
                    <option value="">Chọn Tỉnh/Thành Phố</option>
                    {provinces.map((province) => (
                      <option key={province.ProvinceID} value={province.ProvinceID}>
                        {province.ProvinceName}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group>
                  <Form.Label>Quận/Huyện</Form.Label>
                  <Form.Select
                    name="districtCode"
                    value={address.districtCode}
                    onChange={(e) => {
                      handleInputChange(e);
                      fetchWards(e.target.value);
                    }}
                    className="w-full px-4 py-3 rounded-lg border-2"
                    required
                  >
                    <option value="">Chọn Quận/Huyện</option>
                    {districts.map((district) => (
                      <option key={district.DistrictID} value={district.DistrictID}>
                        {district.DistrictName}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group>
                  <Form.Label>Phường/Xã</Form.Label>
                  <Form.Select
                    name="wardCode"
                    value={address.wardCode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border-2"
                    required
                  >
                    <option value="">Chọn Phường/Xã</option>
                    {wards.map((ward) => (
                      <option key={ward.WardCode} value={ward.WardCode}>
                        {ward.WardName}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>

              {/* Address Detail */}
              <Form.Group>
                <Form.Label>Chi Tiết Địa Chỉ</Form.Label>
                <Form.Control
                  as="textarea"
                  name="AddressDetail"
                  value={address.AddressDetail}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border-2"
                  rows={3}
                  required
                />
              </Form.Group>

              {/* Submit Button */}
              <div className="flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="px-6 py-2 bg-orange-500 text-white rounded-lg 
                            hover:bg-orange-600 transition-colors"
                >
                  Lưu Địa Chỉ
                </motion.button>
              </div>
            </Form>
          </motion.div>
        </Container>
      </div>
    </div>
  );
};

export default Address;
