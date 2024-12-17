import React from 'react';
import { placesToGo } from '../../data/data';
import PlaceToGo from './PlaceToGo';

const PlacesToGo = () => {
    return (
        <>
            <section className="section bg-white" id="featured">
                <div className="section-title">
                    <h2 className="text-gray-800 font-expletus">Nguyên liệu đặc sắc</h2>
                    <div className={`underline bg-gray-900`}></div>
                </div>
                <div className="section-center ">
                    <div className="flex flex-wrap w-full mb-20 ">
                        <h1 className="capitalize sm:text-3xl text-2xl font-medium title-font text-gray-900 lg:w-1/3 lg:mb-0 mb-4">
                        Khám phá nguyên liệu phổ biến
                        </h1>
                        <p className="lg:pl-6 lg:w-2/3 mx-auto leading-relaxed text-base">
                        Bạn có thể tự do thưởng thức những hương vị phong phú ngay khi đến nơi. Hãy để bản thân đắm chìm trong những món ăn mới lạ, những hương vị độc đáo và sự đa dạng ẩm thực mà Việt Nam mang lại. Những trải nghiệm ẩm thực thật sự đáng nhớ đang chờ đón bạn. Sống trọn vẹn với những món ăn tuyệt vời tại Việt Nam.
                        </p>
                    </div>

                    {/* Places-to-go */}
                    <div className="flex flex-wrap md:-m-2 -m-1">
                        {/* 1st half */}
                        <div className="places-container">
                            {placesToGo.slice(0, 3).map((place, index) => (
                                <PlaceToGo
                                    key={place.id}
                                    place={place}
                                    half={index !== placesToGo.slice(0, 3).length - 1}
                                />
                            ))}
                        </div>

                        {/* 2nd half */}
                        <div className="places-container">
                            {placesToGo.slice(3, placesToGo.length).map((place, index) => (
                                <PlaceToGo key={place.id} place={place} half={index !== 0} />
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default PlacesToGo;
