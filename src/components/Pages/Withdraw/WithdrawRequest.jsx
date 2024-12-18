import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import Cookies from 'js-cookie';
import { getAccountById } from '../../services/AccountService';
import { addCoinTransaction } from '../../services/Transaction';

import { updateAccount } from "../../services/AccountService";

import Swal from 'sweetalert2';
import { decryptData } from "../../Encrypt/encryptionUtils";
const WithDrawRequest = () => {

    const [UserId, setUserId] = useState('');
    const [account, setAccount] = useState('');
    const [amount, setAmount] = useState(0);

    const [status, setStatus] = useState('')
    const [bankAccountQR, setBankAccountQR] = useState(null);
    const [error, setError] = useState(null);
    const conversionRate = 0.80;
    const navigate = useNavigate();
    const handleClick = () => {
        navigate("/withdrawlist");
    };
    useEffect(() => {
        const fetchData = async () => {
            const storedUserId = decryptData(Cookies.get("UserId"));

            if (storedUserId) {
                setUserId(storedUserId);

                const response = await getAccountById(decryptData(Cookies.get("UserId")));

                setAccount(response);
                setBankAccountQR(response.accountProfile.bankAccountQR);
                setStatus(response.accountProfile.status);
            }
            else {
                window.location.href = '/login';
            }

        };

        fetchData();
    }, []);

    const handleSubmit = async (event) => {

        event.preventDefault();
        if (amount > account.coin) {
            setError('Số xu muốn rút không được vượt quá số xu hiện có: ' + account.coin);
        } else if (Math.round(amount * conversionRate) < 50000) {
            setError('Số tiền muốn rút phải là 50,000đ hoặc hơn');
        } else {

            const account = await getAccountById(UserId);
            account.coin = account.coin - amount;
            const response2 = await updateAccount(account);
            if (!response2.status) {
                setError('Rút xu thất bại');
                return;
            }

            const Cointransactionrequest = {
                CustomerId: UserId,
                MoneyFluctuations: Math.round(amount * conversionRate),
                CoinFluctuations: (-amount),
                Detail: 'Rút xu',
                Status: -1
            }
            const response = await addCoinTransaction(Cointransactionrequest);


            if (response.status) {
                Swal.fire({
                    title: 'Gửi yêu cầu rút xu thành công!',
                    text: 'Vui lòng gửi khiếu nại nếu có bất kỳ vấn đề gì!',
                    icon: 'success',
                    confirmButtonText: 'OK',
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.location.href = '/withdrawlist';
                    }
                });
            }
            else {
                Swal.fire({
                    title: 'Gửi yêu cầu rút xu thất bại!',
                    text: 'Vui lòng kiểm tra lại!',
                    icon: 'error',
                    confirmButtonText: 'OK',
                });
            }
            setError(null);
        }
    };


    return (
        <section className='text-2xl '>
            <div className="section-center min-h-screen">
                <h1><strong style={{ color: 'red' }}>Vui lòng kiểm tra kỹ thông tin trước khi yêu cầu rút xu</strong></h1>
                <div className="row my-4">
                    <div className="col-md-4 text-center">
                        <div className="card">
                            <div className="card-body">
                                <h5 className="card-title mb-4"><strong>Thông tin tài khoản: </strong></h5>
                                <p className="card-text font-medium text-xl mb-2">Tên của bạn: <span className='italic font-bold'>{account.userName}</span></p>
                                <p className="card-text font-medium text-xl mb-3    ">Email: <span className='italic font-bold'>{account.email}</span></p>
                                <p className="card-text font-medium text-xl">Mã QR tài khoản ngân hàng:
                                    <img className='mt-4 mx-auto' src={bankAccountQR} alt="QR" />
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-8">
                        <div className="card">
                            <div className="card-body p-4">
                                <div className='flex items-center justify-between'>
                                    <h5 className="card-title mb-4"><strong>Rút Tiền </strong></h5>
                                    <button type="info" className="btn btn-info flex text-xl" onClick={handleClick}><span className="material-icons">
                                        reorder
                                    </span>Danh sách yêu cầu</button>
                                </div>
                                <form onSubmit={handleSubmit}>
                                    <p className="card-text font-semibold text-xl mb-2">Tài khoản khả dụng: <span className='text-2xl text-green-500'>{Intl.NumberFormat('de-DE').format(account.coin - amount)} <img src="/images/icon/dollar.png" alt=" " className='h-8 w-8 inline-block' /></span></p>
                                    <div className="form-group font-medium text-red-500">
                                        <label htmlFor="amount">Số xu muốn rút:</label>
                                        <input type="number" className="form-control" id="amount" value={amount} min="0" onChange={(event) => setAmount(event.target.value)} />
                                        {error && <div className="text-danger">{error}</div>}
                                    </div>
                                    <p className="card-text font-semibold text-xl my-4"><span className="material-icons">
                                        currency_exchange
                                    </span> Phí rút: <span className='text-2xl text-green-500'>20%</span></p>
                                    <p className="card-text font-semibold text-xl my-4"><span className="material-icons">
                                        payments
                                    </span> Tiền nhận được = <span className='text-2xl text-green-500'>{Math.round(amount * conversionRate)}₫</span></p>
                                    {status !== 2 ? (
                                        <button type="submit" className="btn btn-success mt-12 flex p-2 font-semibold text-2xl"><span className="material-icons">
                                        attach_money</span>Gửi Yêu Cầu</button>
                                    ) : (
                                        <p className="text-red-600">Bạn có thông tin chưa cập nhật hoàn tất hoặc chưa được duyệt</p>
                                    )}
                                </form>
                            </div>
                        </div>
                    </div>
                </div >
            </div >
        </section>
    )
}

export default WithDrawRequest;