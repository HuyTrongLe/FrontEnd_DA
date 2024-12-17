import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Button } from 'react-bootstrap';
import "bootstrap/dist/css/bootstrap.min.css";
import Swal from 'sweetalert2';
import Cookies from 'js-cookie';
import { motion } from 'framer-motion';
import { FaEdit, FaMapMarkerAlt, FaPhone, FaPlus, FaMapMarked } from 'react-icons/fa';
import Sidebar from '../Customer/Sidebar';
import { useNavigate } from 'react-router-dom';
import { decryptData } from "../Encrypt/encryptionUtils";
const formatPhoneNumber = (number) => {
  // Remove any non-digit characters
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

const displayPhoneNumber = (number) => {
  if (!number) return '';
  // Convert 84xxx to 0xxx for display
  if (number.startsWith('84')) {
    return '0' + number.slice(2);
  }
  return number;
};

const AddressEdit = () => {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const userId = decryptData(Cookies.get("UserId"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAddressesWithDetails = async () => {
      try {
        const response = await axios.get(`https://rmrbdapi.somee.com/odata/CustomerAddress`, {
          headers: {
            'Content-Type': 'application/json',
            'Token': '123-abc',
          },
        });
        const filteredAddresses = response.data.filter(address => address.accountId === parseInt(userId));

        const addressesWithDetails = await Promise.all(
          filteredAddresses.map(async (address) => {
            const provinceName = await getProvinceName(address.provinceCode);
            const districtName = await fetchDistrictName(address.provinceCode, address.districtCode);
            const WardName = await fetchWardName(address.districtCode, address.wardCode);
        
            return {
              ...address,
              provinceName: provinceName || 'Unknown Province',
              districtName: districtName || 'Unknown District',
              WardName: WardName || 'Unknown Ward',  // Make sure to correctly assign the ward name
            };
          })
        );

        setAddresses(addressesWithDetails);
      } catch (error) {
        console.error('Error fetching addresses:', error);
        showErrorAlert('Failed to load addresses.');
      } finally {
        setLoading(false);
      }
    };

    fetchAddressesWithDetails();
  }, [userId]);

  const getProvinceName = async (provinceCode) => {
    try {
      const response = await axios.get('https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/province', {
        headers: { 'Token': '780e97f0-7ffa-11ef-8e53-0a00184fe694' }
      });
      const province = response.data.data.find((prov) => prov.ProvinceID === Number(provinceCode));
      return province ? province.ProvinceName : null;
    } catch (error) {
      console.error('Error fetching province name:', error);
      return null;
    }
  };

  const fetchDistrictName = async (provinceCode, districtCode) => {
    try {
      const response = await axios.post(
        'https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/district',
        { province_id: Number(provinceCode) },
        { headers: { 'Token': '780e97f0-7ffa-11ef-8e53-0a00184fe694' } }
      );
      const district = response.data.data.find((dist) => dist.DistrictID === districtCode);
      return district ? district.DistrictName : null;
    } catch (error) {
      console.error('Error fetching district name:', error);
      return null;
    }
  };

  const fetchWardName = async (districtCode, wardCode) => {
    try {
      const response = await axios.post(
        'https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/ward',
        { district_id: Number(districtCode) },
        { headers: { 'Token': '780e97f0-7ffa-11ef-8e53-0a00184fe694' } }
      );
      const ward = response.data.data.find((w) => w.WardCode === wardCode);
      return ward ? ward.WardName : null;
    } catch (error) {
      console.error('Error fetching ward name:', error);
      return null;
    }
  };

  const handleEditAddress = (address) => {
    // No need to fetch districts and wards here since the modal is removed
    // The component will redirect to /address when the "Thêm địa chỉ mới" button is clicked
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'phoneNumber') {
      // Format phone number when it's being input
      const formattedNumber = formatPhoneNumber(value);
      setSelectedAddress((prev) => ({
        ...prev,
        [name]: formattedNumber,
      }));
    } else {
      setSelectedAddress((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const showSuccessAlert = (message) => {
    Swal.fire({
      title: 'Success!',
      text: message,
      icon: 'success',
      confirmButtonColor: '#f97316', // orange-500
      timer: 2000,
      timerProgressBar: true
    });
  };

  const showErrorAlert = (message) => {
    Swal.fire({
      title: 'Error!',
      text: message,
      icon: 'error',
      confirmButtonColor: '#f97316', // orange-500
    });
  };

  const showLoadingAlert = () => {
    Swal.fire({
      title: 'Processing...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  };

  const checkPhoneNumberExists = async () => {
    try {
      const response = await axios.get(
        `https://rmrbdapi.somee.com/odata/CustomerAddress?$filter=phoneNumber eq '${selectedAddress.phoneNumber}'`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Token': '123-abc',
          },
        }
      );
      if (response.data.value.length > 0) {
        setIsPhoneAvailable(true);
      } else {
        setIsPhoneAvailable(false);
      }
    } catch (error) {
      console.error('Error checking phone number:', error);
      showErrorAlert('Failed to check phone number availability.');
    }
  };

  const handleSendOtp = async () => {
    showLoadingAlert();
    try {
      // Your OTP sending logic here
      setOtpSent(true);
      Swal.close(); // Close loading alert
      showSuccessAlert('OTP sent successfully!');
    } catch (error) {
      Swal.close();
      showErrorAlert('Failed to send OTP.');
    }
  };

  const handleVerifyOtp = () => {
    if (otpCode === '123456') {  // Replace with actual verification logic
      setOtpVerified(true);
      showSuccessAlert('OTP verified successfully!');
    } else {
      showErrorAlert('Invalid OTP. Please try again.');
    }
  };

  const showSuccessToast = () => {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      }
    });

    Toast.fire({
      icon: 'success',
      title: 'Đã cập nhật địa chỉ thành công!'
    });
  };

  const saveAddress = async (e) => {
    e.preventDefault();
  
    if (!selectedAddress.wardCode || !selectedAddress.districtCode || 
        !selectedAddress.provinceCode || !selectedAddress.addressDetail || 
        !selectedAddress.phoneNumber) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: 'Vui lòng điền đầy đủ thông tin.',
        confirmButtonColor: '#f97316'
      });
      return;
    }
  
    const addressData = {
      AddressID: selectedAddress.addressId,
      AccountID: userId,
      PhoneNumber: selectedAddress.phoneNumber,
      AddressStatus: selectedAddress.addressStatus || 1,
      wardCode: selectedAddress.wardCode,
      districtCode: selectedAddress.districtCode,
      provinceCode: selectedAddress.provinceCode,
      addressDetail: selectedAddress.addressDetail,
    };
  
    // Show loading spinner
    Swal.fire({
      title: 'Đang xử lý...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  
    try {
      const response = await axios.put(
        `https://rmrbdapi.somee.com/odata/CustomerAddress/${selectedAddress.addressId}`, 
        addressData, 
        {
          headers: {
            'Content-Type': 'application/json',
            'Token': '123-abc',
          },
        }
      );
  
      if (response.status === 200 || response.status === 201) {
        // Update the address in the local state
        setAddresses(prevAddresses => {
          return prevAddresses.map(addr => {
            if (addr.addressId === selectedAddress.addressId) {
              const province = provinces.find(p => p.ProvinceID === Number(selectedAddress.provinceCode));
              const district = districts.find(d => d.DistrictID === Number(selectedAddress.districtCode));
              const ward = wards.find(w => w.WardCode === selectedAddress.wardCode);
              
              return {
                ...addr,
                addressDetail: selectedAddress.addressDetail,
                phoneNumber: selectedAddress.phoneNumber,
                provinceCode: selectedAddress.provinceCode,
                districtCode: selectedAddress.districtCode,
                wardCode: selectedAddress.wardCode,
                provinceName: province?.ProvinceName || addr.provinceName,
                districtName: district?.DistrictName || addr.districtName,
                WardName: ward?.WardName || addr.WardName
              };
            }
            return addr;
          });
        });

        // Close loading spinner
        Swal.close();

        // Show success toast
        showSuccessToast();

        // Close the modal with animation
        setShowModal(false);

        // Add animation to the updated address card
        const updatedCard = document.querySelector(`[data-address-id="${selectedAddress.addressId}"]`);
        if (updatedCard) {
          updatedCard.classList.add('highlight-update');
          setTimeout(() => {
            updatedCard.classList.remove('highlight-update');
          }, 2000);
        }
      }
    } catch (error) {
      Swal.close();
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: 'Lỗi cập nhật địa chỉ. Vui lòng thử lại.',
        confirmButtonColor: '#f97316'
      });
      console.error('Error saving address:', error);
    }
  };

  return (
    <div className="flex flex-col md:flex-row justify-center items-start p-4 space-y-8 md:space-y-0 md:space-x-8">
      <Sidebar />
      <div className="flex flex-col">
        <Container className="">
          <div className="section-center w-[1140px] bg-white p-4 rounded-lg shadow-md flex flex-col text-xl">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <div className="flex items-center space-x-3">
                <FaMapMarked className="text-2xl text-orange-500" />
                <h2 className="text-2xl font-bold text-gray-800">Quản lý địa chỉ</h2>
              </div>
              {!loading && addresses.length > 0 && (
                <Button
                  onClick={() => navigate('/address')}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg"
                >
                  <FaPlus className="text-sm" />
                  <span>Thêm địa chỉ mới</span>
                </Button>
              )}
            </div>
            
            <div className="grid gap-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-[400px] bg-gray-50 rounded-xl">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
                  <p className="text-gray-500 font-medium">Đang tải địa chỉ...</p>
                </div>
              ) : addresses.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[400px] bg-gray-50 rounded-xl p-8">
                  <FaMapMarkerAlt className="text-6xl text-gray-300 mb-4" />
                  <p className="text-2xl text-gray-400 font-bold mb-2">Chưa có địa chỉ nào</p>
                  <p className="text-gray-400 mb-6">Thêm địa chỉ mới để quản lý đơn hàng dễ dàng hơn</p>
                  <Button
                    onClick={() => navigate('/address')}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg"
                  >
                    <FaPlus className="text-sm" />
                    <span>Thêm địa chỉ mới</span>
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {addresses.map((address) => (
                    <motion.div
                      key={address.addressId}
                      data-address-id={address.addressId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200"
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-3">
                          <div className="flex items-center text-gray-700">
                            <FaMapMarkerAlt className="mr-3 text-lg text-orange-500" />
                            <span className="font-medium text-lg">{address.addressDetail}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <FaPhone className="mr-3 text-lg text-green-500" />
                            <span className="font-medium">{displayPhoneNumber(address.phoneNumber)}</span>
                          </div>
                          <div className="flex items-center text-gray-500 ml-1">
                            <span className="text-sm">
                              {address.provinceName} • {address.districtName} • {address.WardName}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="outline-primary"
                          onClick={() => handleEditAddress(address)}
                          className="flex items-center px-4 py-2 text-orange-500 border-2 border-orange-500 rounded-lg hover:bg-orange-50 transition-all duration-200 font-medium"
                        >
                          <FaEdit className="mr-2" />
                          Chỉnh sửa
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
};

// Add this CSS to your stylesheet
const styles = `
  .highlight-update {
    animation: highlightFade 2s ease-in-out;
  }

  @keyframes highlightFade {
    0% {
      background-color: rgba(249, 115, 22, 0.2);
      transform: scale(1.02);
    }
    100% {
      background-color: transparent;
      transform: scale(1);
    }
  }
`;

// Add styles to document
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default AddressEdit;
