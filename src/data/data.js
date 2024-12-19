import placesBo from "/images/placeRecipe/placeBo.jpg";
import placesGa from "/images/placeRecipe/placeGa.jpg";
import placesCa from "/images/placeRecipe/placeCa.jpg";
import placesHeo from "/images/placeRecipe/placeHeo.jpg";
import placesChay from "/images/placeRecipe/placeChay.jpg";
import placesTom from "/images/placeRecipe/placeTom.jpg";

// places-to-go images
import boLucLac from "/images/placeRecipe/boLucLac.jpg";
import boNuong from "/images/placeRecipe/boNuong.jpg";
import boSotVang from "/images/placeRecipe/boSotVang.jpg";
import caKhoTo from "/images/placeRecipe/caKhoTo.jpg";
import caNuong from "/images/placeRecipe/caNuong.jpg";
import gaKhoGung from "/images/placeRecipe/gaKhoGung.jpg";
import gaNuongLu from "/images/placeRecipe/gaNuongLu.jpg";
import heoKhoTau from "/images/placeRecipe/heoKhoTau.jpg";
import heoNuongMamChao from "/images/placeRecipe/heoNuongMamChao.jpg";
import chayChaGioChay from "/images/placeRecipe/chayChaGioChay.jpg";
import chayTauHuSotCaChua from "/images/placeRecipe/chayTauHuSotCaChua.jpg";
import chayNamKhoTieu from "/images/placeRecipe/chayNamKhoTieu.jpg";
import tomHapNuocDua from "/images/placeRecipe/tomHapNuocDua.jpg";
import tomTempura from "/images/placeRecipe/tomTempura.jpg";
import tomXotBoToi from "/images/placeRecipe/tomXotBoToi.jpg";
import tomSuHapBia from "/images/placeRecipe/tomSuHapBia.jpg";
import tomRangTrungMuoi from "/images/placeRecipe/tomRangTrungMuoi.jpg";

import websiteIcon from "/images/icon/Web.svg";
import apiIcon from "/images/icon/API.svg";
import databaseIcon from "/images/icon/DATA.svg";
import customSolutionsIcon from "/images/icon/SOLUTION.svg";
import ecommerceIcon from "/images/icon/ECOMMERCE.svg";
import supportIcon from "/images/icon/SUPPORT.svg";

export const leftLinks = [
  { href: "/", title: "Trang chủ" },
  { href: "/recharge", title: "Nạp xu" },
];
export const rightLinks = [
  { href: "/faq", title: "FAQ" },
];

export const filterableData = [
  {
    name: "recipe",
    src: "https://images.immediate.co.uk/production/volatile/sites/30/2020/08/chorizo-mozarella-gnocchi-bake-cropped-9ab73a3.jpg?quality=90&webp=true&resize=375,341",
    title: "Easy recipes",
    text: "Keep it easy with these simple but delicious recipes. From make-ahead lunches and midweek meals to fuss-free sides and moreish cakes, we've got everything",
  },
  {
    name: "book",
    src: "https://ph-test-11.slatic.net/p/63849abfbb4eb6035fdfbc2b35764ecd.jpg",
    title: "Save Your Cooking Recipe",
    text: "By keeping a blank recipe book to write in, you can recreate a recipe in your own kitchen, capture those missing details, and make a truly special dish.",
  },
  {
    name: "ebook",
    src: "https://www.eastathome.com/cdn/shop/files/ebook-spread-2-min_2000x2000.jpg?v=1695596190",
    title: "Modeller",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  {
    name: "recipe",
    src: "https://images.immediate.co.uk/production/volatile/sites/30/2020/08/easy-chicken-curry-aa22a0b.jpg?quality=90&webp=true&resize=375,341",
    title: "Chicken curry",
    text: "This easy staple chicken curry is a fantastic recipe for family dinners. It's made with just a handful of ingredients and is enriched with creamy yogurt.",
  },
  {
    name: "book",
    src: "https://images.squarespace-cdn.com/content/v1/5f7396b28797c41c9fcb85f3/1698864630748-ZYL07A4ALTWE59BR7GGR/Spring_Planner_Book_Bag_Pack4.jpeg?format=1000w",
    title: "Healthy Food Guide",
    text: "Get a great Healthy Food Guide Cookbook, all packed full of tasty, healthy recipe ideas!",
  },
  {
    name: "ebook",
    src: "https://www.eastathome.com/cdn/shop/files/ebook-spread-5-min_2000x2000.jpg?v=1695596295",
    title: "Artist",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  {
    name: "recipe",
    src: "https://images.immediate.co.uk/production/volatile/sites/30/2020/08/yummy-scrummy-carrot-cake_1-964d640.jpg?quality=90&webp=true&resize=375,341",
    title: "Carrot cake",
    text: "Delight friends with an afternoon tea that includes this easy carrot cake. You can bake the cake, freeze it and just drizzle over the icing on the day",
  },
  {
    name: "book",
    src: "https://media.takealot.com/covers_images/01e7415ef94d444ba95368791de94318/s-pdpxl.file",
    title: "Family Favourite Recipes",
    text: "Practical Blank Cooking Recipe BookThis Blank Cooking Recipe Book contains many interesting features, here is how to use them Choose a different color for every bookmark next to the type of dish.",
  },
  {
    name: "ebook",
    src: "https://templatelab.com/wp-content/uploads/2023/06/Recipe-Book-Template-3-scaled.jpg",
    title: "Saxophonist",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
];
export const services = [
  {
    id: 1,
    service: "Phát triển Website",
    description:
      "Phát triển website quản lý công thức và phân phối sách sử dụng .NET, ReactJS và RESTful API, giúp tối ưu hóa hiệu suất và trải nghiệm người dùng.",
    icon: websiteIcon,
    border: "border-b md:border-r",
  },
  {
    id: 2,
    service: "Tích hợp API",
    description:
      "Tích hợp RESTful API để đồng bộ dữ liệu giữa các hệ thống và đảm bảo kết nối hiệu quả cho quản lý công thức và sách.",
    icon: apiIcon,
    border: "border-b lg:border-r",
  },
  {
    id: 3,
    service: "Quản lý Cơ sở Dữ liệu",
    description:
      "Sử dụng SQL Server để quản lý dữ liệu sách và công thức, đảm bảo truy xuất nhanh và an toàn.",
    icon: databaseIcon,
    border: "border-b md:border-r lg:border-r-0",
  },
  {
    id: 4,
    service: "Giải pháp Tùy Chỉnh",
    description:
      "Cung cấp giải pháp tùy chỉnh phù hợp với nhu cầu cụ thể, từ quản lý sách đến công thức nấu ăn.",
    icon: customSolutionsIcon,
    border: "border-b lg:border-r lg:border-b-0",
  },
  {
    id: 5,
    service: "Tích hợp Thương mại Điện tử",
    description:
      "Tích hợp chức năng bán sách trực tuyến, xử lý thanh toán và quản lý đơn hàng dễ dàng và bảo mật.",
    icon: ecommerceIcon,
    border: "border-b md:border-r md:border-b-0 lg:border-b-0",
  },
  {
    id: 6,
    service: "Duy trì & Hỗ trợ",
    description:
      "Cung cấp bảo trì và hỗ trợ liên tục, đảm bảo hệ thống hoạt động ổn định và bảo mật.",
    icon: supportIcon,
    border: "",
  },
];
export const placesToGo = [
  {
    id: 1,
    name: "Bò",
    imageSrc: placesBo,
    description: [
      "Thịt Bò là một món ăn nổi tiếng, được yêu thích tại nhiều khu vực ở Việt Nam. Thành phố này nổi bật với sự kết hợp hài hòa giữa các món ăn đậm đà và các gia vị đặc trưng. Mỗi món thịt bò được chế biến theo phong cách riêng, mang lại những trải nghiệm đặc sắc cho người thưởng thức.",
      "Thịt Bò là một trong những món ăn chính tại Việt Nam, dễ dàng nhận thấy sự pha trộn giữa sự hiện đại và các món ăn truyền thống. Các quán ăn bày bán thịt bò chế biến theo nhiều cách khác nhau từ xào, nướng đến hấp, mỗi nơi lại mang một hương vị khác biệt.",
      "Thành phố này còn nổi bật với các địa điểm du lịch và các món ăn độc đáo đi kèm, từ các buổi biểu diễn văn hóa đến các khu chợ nổi tiếng về món thịt bò.",
    ],
    places: [
      {
        id: 1,
        name: "Bò Lúc Lắc",
        description: [
          "Bò Lúc Lắc là một món ăn đặc trưng, phổ biến tại các thành phố lớn của Việt Nam. Món ăn này được chế biến từ thịt bò tươi ngon, xào nhanh với các gia vị đặc trưng tạo nên hương vị độc đáo, đậm đà.",
          "Món ăn này rất thích hợp cho những buổi tụ tập bạn bè hoặc gia đình, ăn kèm với cơm nóng và rau sống.",
          "Bò Lúc Lắc cũng là món ăn dễ chế biến tại nhà, nhưng khi thưởng thức tại các quán ăn, bạn sẽ cảm nhận được sự hòa quyện của các gia vị và hương vị từ thịt bò.",
        ],
        images: [
          {
            id: 1,
            imageSrc: boLucLac,
            imageAlt: "Bò Lúc Lắc",
          },
        ],
      },
      {
        id: 2,
        name: "Bò Nướng Lạc Cảnh",
        description: [
          "Bò Nướng Lạc Cảnh là món ăn mang đậm hương vị miền Bắc, nơi thịt bò được nướng chín vừa tới, ăn kèm với các loại gia vị và rau thơm tạo nên một sự kết hợp hoàn hảo.",
          "Món ăn này đặc biệt hấp dẫn với những miếng thịt bò nướng mềm, thơm và đậm đà gia vị. Bạn có thể thưởng thức tại các nhà hàng chuyên về thịt bò nướng hoặc tại các quán ăn vỉa hè ở các thành phố lớn.",
          "Bò Nướng Lạc Cảnh thường được ăn kèm với bánh mì hoặc cơm trắng, làm món ăn chính trong các bữa ăn gia đình.",
        ],
        images: [
          {
            id: 1,
            imageSrc: boNuong,
            imageAlt: "Bò Nướng Lạc Cảnh",
          },
        ],
      },
      {
        id: 3,
        name: "Bò Sốt Vang",
        description: [
          "Bò Sốt Vang là món ăn đặc trưng của miền Trung, được chế biến từ thịt bò hầm nhừ, kết hợp với các gia vị, tạo nên một món ăn vừa thơm ngon vừa bổ dưỡng.",
          "Món này thường được ăn kèm với bánh mì hoặc cơm trắng, thích hợp trong những ngày lạnh hoặc khi bạn muốn thưởng thức một bữa ăn ấm áp.",
          "Ngoài thịt bò hầm, món ăn này còn có các loại rau củ, gia vị và nước sốt đặc biệt giúp món ăn thêm phần hấp dẫn.",
        ],
        images: [
          {
            id: 1,
            imageSrc: boSotVang,
            imageAlt: "Bò Sốt Vang",
          },
        ],
      },
    ],
  },
  {
    id: 2,
    name: "Gà",
    imageSrc: placesGa,
    description: [
      "Gà là món ăn phổ biến và dễ chế biến trong các gia đình Việt Nam. Món gà có thể chế biến theo nhiều cách khác nhau như chiên, nướng, luộc hoặc xào, mỗi món đều có sự hấp dẫn riêng.",
      "Gà mang lại giá trị dinh dưỡng cao, thường được chế biến trong các bữa cơm gia đình hoặc các bữa tiệc nhỏ.",
      "Các món gà cũng có thể được kết hợp với các món ăn khác như cơm, bún, hoặc làm thành các món gỏi, tạo sự phong phú cho bữa ăn.",
    ],
    places: [
      {
        id: 1,
        name: "Gà Nướng Lu",
        description: [
          "Gà Nướng Lu là món ăn đặc trưng của miền Bắc, gà được nướng trong lò đất hoặc lò than, tạo ra một hương vị thơm ngon, giòn rụm. Món ăn này thường được ăn kèm với rau sống và nước chấm đậm đà.",
          "Món Gà Nướng Lu thường xuất hiện trong các bữa tiệc gia đình hoặc các dịp đặc biệt, mang đến cảm giác ấm cúng và ngon miệng.",
          "Gà Nướng Lu có thể được chế biến từ gà ta, giúp món ăn trở nên ngọt và mềm hơn.",
        ],
        images: [
          {
            id: 1,
            imageSrc: gaNuongLu,
            imageAlt: "Gà Nướng Lu",
          },
        ],
      },
      {
        id: 2,
        name: "Gà Kho Gừng",
        description: [
          "Gà Kho Gừng là một món ăn dân dã nhưng rất hấp dẫn. Thịt gà được kho nhừ với gừng, gia vị và nước mắm, mang lại một hương vị đậm đà, vừa cay nồng lại vừa ngọt ngào.",
          "Món ăn này thích hợp với cơm trắng hoặc bún, ăn kèm với dưa chua để làm dậy lên hương vị đặc trưng.",
          "Gà Kho Gừng còn có tác dụng giải cảm, giúp cơ thể ấm lên trong những ngày se lạnh.",
        ],
        images: [
          {
            id: 1,
            imageSrc: gaKhoGung,
            imageAlt: "Gà Kho Gừng",
          },
        ],
      },
    ],
  },
  {
    id: 3,
    name: "Cá",
    imageSrc: placesCa,
    description: [
      "Cá là món ăn không thể thiếu trong bữa ăn của người Việt, đặc biệt là cá nước ngọt và cá biển. Các món cá phong phú từ chiên, nướng đến kho, xào đều rất phổ biến.",
      "Cá thường được chế biến trong các bữa cơm gia đình hoặc các món ăn đặc sản của các vùng miền.",
      "Cá cũng có giá trị dinh dưỡng cao, tốt cho sức khỏe và là món ăn yêu thích trong các bữa ăn hàng ngày.",
    ],
    places: [
      {
        id: 1,
        name: "Cá Kho Tộ",
        description: [
          "Cá Kho Tộ là món ăn đặc sản miền Nam, nổi tiếng với cá kho trong nồi đất, thấm đẫm gia vị như nước mắm, tiêu, ớt và đường, tạo nên một món ăn ngọt, mặn hài hòa.",
          "Món cá này có thể ăn kèm với cơm trắng, mang lại cảm giác ấm áp và ngon miệng.",
          "Cá Kho Tộ thường được chế biến từ các loại cá tươi, phổ biến nhất là cá lóc, cá trê hoặc cá diêu hồng.",
        ],
        images: [
          {
            id: 1,
            imageSrc: caKhoTo,
            imageAlt: "Cá Kho Tộ",
          },
        ],
      },
      {
        id: 2,
        name: "Cá Nướng",
        description: [
          "Cá Nướng là món ăn đơn giản nhưng rất hấp dẫn, được chế biến từ cá tươi, nướng trên than hoa cho đến khi da cá giòn và thơm.",
          "Món cá nướng này thường được ăn kèm với rau sống, bánh tráng và nước mắm chua ngọt.",
          "Cá nướng có thể là cá biển hoặc cá nước ngọt, tùy theo sở thích của mỗi người.",
        ],
        images: [
          {
            id: 1,
            imageSrc: caNuong,
            imageAlt: "Cá Nướng",
          },
        ],
      },
    ],
  },
  {
    id: 4,
    name: "Thịt Heo",
    imageSrc: placesHeo,
    description: [
      "Heo là một nguyên liệu quen thuộc trong các món ăn Việt Nam, từ thịt heo nướng, kho, xào đến các món đặc sản như bún thịt nướng hay thịt heo cuốn lá sen. Thịt heo có thể chế biến thành vô vàn món ăn hấp dẫn và được yêu thích tại nhiều vùng miền.",
      "Các món thịt heo không chỉ đậm đà hương vị mà còn mang lại giá trị dinh dưỡng cao, thích hợp với bữa ăn gia đình hoặc các bữa tiệc nhỏ.",
      "Thịt heo có thể chế biến với các gia vị truyền thống Việt Nam, giúp món ăn thêm phần hấp dẫn và dễ ăn.",
    ],
    places: [
      {
        id: 1,
        name: "Heo Nướng Mắm Chao",
        description: [
          "Heo Nướng Mắm Chao là món ăn đặc trưng của miền Nam, nơi thịt heo được nướng chín vàng giòn và ăn kèm với mắm chao, tạo nên một hương vị thơm ngon và đậm đà.",
          "Món này thường được ăn kèm với cơm trắng, rau sống và nước mắm chua ngọt.",
          "Heo Nướng Mắm Chao thường xuất hiện trong các bữa tiệc hoặc các dịp lễ lớn, rất thích hợp cho các bữa ăn gia đình.",
        ],
        images: [
          {
            id: 1,
            imageSrc: heoNuongMamChao,
            imageAlt: "Heo Nướng Mắm Chao",
          },
        ],
      },
      {
        id: 2,
        name: "Thịt Heo Kho Tàu",
        description: [
          "Thịt Heo Kho Tàu là món ăn đặc sản của miền Nam, được chế biến từ thịt heo tươi, kho nhừ với nước dừa tươi, tạo nên hương vị thơm ngọt đậm đà.",
          "Món ăn này thích hợp với cơm trắng, giúp bữa ăn thêm phần ngon miệng và ấm áp.",
          "Thịt Heo Kho Tàu còn là món ăn phổ biến trong các dịp Tết Nguyên Đán, được nhiều gia đình chế biến để đón Tết.",
        ],
        images: [
          {
            id: 1,
            imageSrc: heoKhoTau,
            imageAlt: "Thịt Heo Kho Tàu",
          },
        ],
      },
    ],
  },
  {
    id: 5,
    name: "Món Chay",
    imageSrc: placesChay,
    description: [
      "Ngày nay, không chỉ riêng những nhà tu mới ăn chay, mà các món chay còn dần trở nên phổ biến hơn với nhiều người. Món chay dễ chế biến và dễ ăn.",
      "Tổng hợp Top các món chay ngon thích hợp khi ăn vào ngày rằm hoặc cúng ông bà, bạn cùng theo dõi nhé.",
    ],
    places: [
      {
        id: 1,
        name: "Tàu hủ sốt cà chua",
        description: [
          "Thật không thể phủ nhận rằng tàu hủ sốt cà chua là món chay ngon cực kỳ quen thuộc trong các bữa cơm. Mùi hương thơm ngon của sốt cà chua, hòa cùng vị béo nhẹ của tàu hủ tạo nên món tàu hủ sốt cà chua hấp dẫn, tròn vị.",
        ],
        images: [
          {
            id: 1,
            imageSrc: chayTauHuSotCaChua,
            imageAlt: "Tàu hủ sốt cà chua",
          },
        ],
      },
      {
        id: 2,
        name: "Chả giò chay",
        description: [
          "Chả giò chay được biết đến là món chay ngon đặc trưng trong nền ẩm thực thức ăn chay tịnh. Chả giò chay khác với chả giò nhân tôm cua hay tôm thịt mà bạn thường ăn, phần nhân bên trong của món này chỉ bao gồm một số loại rau, củ cùng với miến, tàu hủ cắt miếng và nấm hương.",
          "Món chả giò chay hiện nay không chỉ xuất hiện trong các bữa cơm gia đình, mà trong các tiệc cưới có bàn dành cho những người ăn chay, thì món chả giò chay sẽ là món khai vị hấp dẫn, tuyệt vời.",
        ],
        images: [
          {
            id: 1,
            imageSrc: chayChaGioChay,
            imageAlt: "Chả giò chay",
          },
        ],
      },
      {
        id: 3,
        name: "Nấm kho tiêu",
        description: [
          "Nấm kho tiêu ăn với cơm trắng cực kỳ ngon và hấp dẫn. Tuy chỉ là một món ăn đơn giản, nhưng nấm chứa nhiều dưỡng chất tốt cho cơ thể. Nước kho sền sệt, cay thơm ăn cùng với cơm trắng rất thấm vị. Nấm kho tiêu còn là món chay ngon, bổ dưỡng, rất được người trung niên ưa thích.",
        ],
        images: [
          {
            id: 1,
            imageSrc: chayNamKhoTieu,
            imageAlt: "Nấm Kho Tiêu",
          },
        ],
      },
    ],
  },
  {
    id: 6,
    name: "Tôm",
    imageSrc: placesTom,
    description: [
      "Nếu bạn là 1 tín đồ của hải sản thì làm sao mà bỏ qua được những con tôm tươi ngon với nhiều cách chế biến đa dạng phong phú mà vẫn mang đậm hương vị của biển cả."
    ],
    places: [
      {
        id: 1,
        name: "Tempura tôm rau củ hải sản",
        description: [
          "Tempura tôm rau củ là món ăn có nguồn gốc từ Nhật Bản với lớp bột chiên giòn rụm vàng óng bao phủ bên ngoài. Tôm tươi ngọt kết hợp với các loại rau củ giòn tan tạo nên món ăn hấp dẫn cả về hình thức lẫn hương vị.",
          "Món tempura này thường được ăn kèm với nước chấm thanh nhẹ hoặc tương đậu nành pha chế, khiến bạn khó lòng cưỡng lại được."
        ],
        images: [
          {
            id: 1,
            imageSrc: tomTempura,
            imageAlt: "Tempura tôm rau củ hải sản",
          },
        ],
      },
      {
        id: 2,
        name: "Tôm sú hấp bia",
        description: [
          "Tôm sú hấp bia là món ăn đơn giản nhưng đậm đà hương vị biển. Tôm được hấp cùng với bia và các nguyên liệu như sả, gừng, tạo nên vị ngọt tự nhiên của tôm, hòa quyện với hương thơm thoang thoảng của bia.",
          "Món này giữ nguyên được độ tươi ngon của tôm, thịt chắc và ngọt. Đây là món ăn lý tưởng trong các buổi tiệc hoặc dịp sum họp gia đình."
        ],
        images: [
          {
            id: 1,
            imageSrc: tomSuHapBia,
            imageAlt: "Tôm sú hấp bia",
          },
        ],
      },
      {
        id: 3,
        name: "Tôm xốt bơ tỏi",
        description: [
          "Tôm xốt bơ tỏi là món ăn đậm đà, hấp dẫn với vị béo của bơ và hương thơm nồng của tỏi phi. Tôm được xào nhanh trên lửa lớn để giữ được độ tươi và ngọt của thịt.",
          "Sốt bơ tỏi thấm đều từng con tôm, tạo nên món ăn có hương vị thơm ngon khó cưỡng. Món này thích hợp dùng với bánh mì hoặc cơm nóng, rất được lòng thực khách."
        ],
        images: [
          {
            id: 1,
            imageSrc: tomXotBoToi,
            imageAlt: "Tôm xốt bơ tỏi",
          },
        ],
      },
      {
        id: 4,
        name: "Tôm rang trứng muối",
        description: [
          "Tôm rang trứng muối là món ăn đầy lôi cuốn với sự hòa quyện giữa vị mặn béo của trứng muối và vị ngọt tự nhiên từ tôm. Lớp sốt trứng muối vàng ươm, sánh mịn bao phủ từng con tôm giòn giòn khiến bạn khó cưỡng lại.",
          "Món này không chỉ thơm ngon mà còn rất bổ dưỡng, thích hợp làm món chính trong các bữa ăn gia đình hay tiệc tùng."
        ],
        images: [
          {
            id: 1,
            imageSrc: tomRangTrungMuoi,
            imageAlt: "Tôm rang trứng muối",
          },
        ],
      },
      {
        id: 5,
        name: "Tôm hấp nước dừa",
        description: [
          "Tôm hấp nước dừa là món ăn thanh mát, mang hương vị ngọt dịu tự nhiên từ nước dừa tươi. Tôm sau khi hấp thấm đượm vị ngọt và béo nhẹ từ dừa, thịt tôm mềm và săn chắc.",
          "Món này thường được dùng kèm với muối tiêu chanh hoặc nước mắm ớt để tăng thêm hương vị thơm ngon và đậm đà."
        ],
        images: [
          {
            id: 1,
            imageSrc: tomHapNuocDua,
            imageAlt: "Tôm hấp nước dừa",
          },
        ],
      },
    ],
  },
  
];
