export const translations = {
  vi: {
    home: "Trang chủ",
    tools: "Công cụ",
    searchPlaceholder: "Tìm kiếm công cụ...",
    noResults: "Không tìm thấy công cụ nào",
    themeLight: "Chế độ sáng",
    themeDark: "Chế độ tối",
    heroBadge: "percylab.dev",
    heroTitlePre: "Experimental Web",
    heroTitlePost: "Tools",
    heroSubtitle: "Bộ công cụ hỗ trợ thiết kế, phát triển di động và tiện ích lập trình gọn nhẹ, tinh tế cho GenZ.",
    categories: {
      design: {
        title: "Design & Color",
        desc: "Công cụ xử lý hình ảnh, hiệu ứng và dải màu sắc"
      },
      dev: {
        title: "Developer Tools",
        desc: "Tiện ích mã hóa, tối ưu hóa kích thước app và simulator"
      },
      utilities: {
        title: "Office & Utilities",
        desc: "Tiện ích văn phòng, định dạng tài liệu và chuyển đổi đa năng"
      }
    },
    status: {
      active: "Sẵn sàng",
      soon: "Soon",
      percy: "By Percy"
    },
    footerBuiltBy: "Thiết kế bởi",
    footerAnd: "và",
    // Tool Specific Translations
    toolNames: {
      grain: "grain",
      frame: "frame",
      polafiy: "polafiy",
      palette: "palette",
      gradio: "gradio",
      iconset: "iconset",
      deeplink: "deeplink",
      splashgen: "splashgen",
      base64: "base64",
      jsondiff: "jsondiff",
      img2pdf: "img2pdf",
      esign: "esign",
      bgremove: "bgremove",
      qrcode: "qrcode",
      timestamp: "timestamp"
    },
    toolDescs: {
      grain: "Trình biên tập ảnh Web, áp dụng bộ lọc màu LUT và Polaroid hạt mịn.",
      frame: "Lồng mockup thiết bị (iPhone/Android) vào ảnh chụp màn hình.",
      polafiy: "Tạo khung ảnh Polaroid phong cách hoài cổ từ ảnh chụp.",
      palette: "Trích xuất màu sắc tự động từ ảnh hoặc chấm thủ công.",
      gradio: "Thiết kế dải màu chuyển tiếp gradient, xuất CSS & React Native.",
      iconset: "Tự động tạo và đóng gói bộ AppIcon cho iOS và Android.",
      deeplink: "Kiểm thử deep link trực tiếp trên simulator iOS/Android.",
      splashgen: "Tạo màn hình chào splash screen tương thích mọi thiết bị.",
      base64: "Mã hóa ảnh sang chuỗi Base64 và giải mã chuỗi Base64.",
      jsondiff: "So sánh cấu trúc và tìm điểm khác biệt giữa 2 tệp JSON.",
      img2pdf: "Ghép nhiều hình ảnh thành một tệp tài liệu PDF chất lượng cao.",
      esign: "Tạo chữ ký số vẽ tay hoặc nhập tên, tải PNG nền trong suốt.",
      bgremove: "Xóa nền ảnh tự động bằng AI ngay trên trình duyệt, không cần API key.",
      qrcode: "Tạo mã QR tuỳ chỉnh với nhiều kiểu dáng, màu sắc và logo thương hiệu.",
      timestamp: "Chuyển đổi Unix timestamp sang ngày giờ và ngược lại, hỗ trợ đa múi giờ."
    },
    // Base64 tool
    base64: {
      title: "base64",
      desc: "Mã hóa nhanh các tập tin ảnh của bạn thành chuỗi Base64 siêu tốc để chèn inline vào CSS/HTML, hoặc giải mã chuỗi Base64 ngược lại thành ảnh.",
      modeEncode: "Mã hóa ảnh (Image to Base64)",
      modeDecode: "Giải mã Base64 (Base64 to Image)",
      chooseImage: "Chọn ảnh để mã hóa",
      dragAndDrop: "kéo thả hoặc nhấp để duyệt ảnh",
      outputTitle: "Kết quả mã hóa Base64",
      outputSubtitle: "Chuỗi ký tự sẵn sàng sử dụng inline",
      outputPlaceholder: "Kết quả Base64 sẽ xuất hiện sau khi bạn tải ảnh lên.",
      inputPlaceholder: "Dán chuỗi Base64 vào đây để giải mã...",
      decodeResult: "Kết quả giải mã ảnh",
      decodeSubtitle: "Xem trước và tải xuống ảnh đã giải mã",
      decodePlaceholder: "Hình ảnh giải mã sẽ hiển thị ở đây.",
      downloadImage: "Tải xuống ảnh",
      copySuccess: "Đã sao chép vào bộ nhớ tạm!",
      copyButton: "Sao chép"
    },
    // Palette tool
    palette: {
      title: "palette",
      desc: "Trích xuất bảng màu sắc thông minh từ bất kỳ hình ảnh nào bằng thuật toán tự động hoặc tự tay lựa chọn qua kính lúp.",
      tabAuto: "Trích xuất tự động (Auto)",
      tabManual: "Chọn màu thủ công (Eye Dropper)",
      chooseImage: "Chọn ảnh để lấy màu",
      dragAndDrop: "kéo thả hoặc nhấp để tải ảnh lên",
      autoTitle: "Bảng màu tự động",
      autoDesc: "Các tông màu chủ đạo được trích xuất tự động.",
      manualTitle: "Bảng màu thủ công",
      manualDesc: "Di chuyển chuột và click vào hình để chấm màu.",
      eyedropperNotSupported: "Trình duyệt của bạn không hỗ trợ EyeDropper API. Vui lòng chấm màu tự động hoặc dùng Chrome/Edge/Safari mới.",
      copySuccess: "Đã sao chép mã màu",
      loading: "Đang tải ảnh..."
    },
    // Gradio tool
    gradio: {
      title: "gradio",
      desc: "Thiết kế dải màu gradient sinh động, xuất CSS và kiểu dáng React Native chỉ với vài thao tác kéo thả trực quan.",
      tabEditor: "Biên tập Gradient",
      tabPresets: "Bảng màu có sẵn",
      direction: "Hướng chuyển sắc",
      colorStart: "Màu bắt đầu",
      colorEnd: "Màu kết thúc",
      cssCode: "Mã CSS Gradient",
      rnCode: "React Native Styles",
      previewTitle: "Xem trước Gradient",
      copySuccess: "Đã sao chép mã gradient!"
    },
    // Iconset tool
    iconset: {
      title: "iconset",
      desc: "Công cụ tự động cắt và đóng gói bộ hình ảnh AppIcon hoàn chỉnh cho các dự án iOS và Android từ một tệp ảnh lớn 1024x1024.",
      uploadTitle: "Tải lên hình ảnh gốc",
      chooseImage: "Chọn ảnh logo 1024x1024 (PNG)",
      dragAndDrop: "kéo thả ảnh logo của bạn vào đây",
      platformTitle: "Nền tảng xuất bản",
      iosLabel: "Bộ AppIcon cho iOS (AppIcon.appiconset)",
      androidLabel: "Bộ AppIcon cho Android (mipmap-*)",
      btnGenerate: "Tạo và Tải xuống bộ AppIcon (.zip)",
      generateSuccess: "Đã khởi tạo bộ Icon thành công! Đang tải xuống...",
      invalidImage: "Vui lòng tải lên ảnh PNG hợp lệ."
    }
  },
  en: {
    home: "Home",
    tools: "Tools",
    searchPlaceholder: "Search tools...",
    noResults: "No tools found",
    themeLight: "Light Mode",
    themeDark: "Dark Mode",
    heroBadge: "percylab.dev",
    heroTitlePre: "Experimental Web",
    heroTitlePost: "Tools",
    heroSubtitle: "A collection of lightweight, beautiful developer and design tools tailored for GenZ.",
    categories: {
      design: {
        title: "Design & Color",
        desc: "Image editing, filter, and color palette utilities"
      },
      dev: {
        title: "Developer Tools",
        desc: "Encoding, mobile optimization, and simulator utilities"
      },
      utilities: {
        title: "Office & Utilities",
        desc: "Document compilers, formatters, and general productive tools"
      }
    },
    status: {
      active: "Active",
      soon: "Soon",
      percy: "By Percy"
    },
    footerBuiltBy: "Designed by",
    footerAnd: "and",
    // Tool Specific Translations
    toolNames: {
      grain: "grain",
      frame: "frame",
      polafiy: "polafiy",
      palette: "palette",
      gradio: "gradio",
      iconset: "iconset",
      deeplink: "deeplink",
      splashgen: "splashgen",
      base64: "base64",
      jsondiff: "jsondiff",
      img2pdf: "img2pdf",
      esign: "esign",
      bgremove: "bgremove",
      qrcode: "qrcode",
      timestamp: "timestamp"
    },
    toolDescs: {
      grain: "Web photo editor, LUT presets, and Polaroid style film grain effects.",
      frame: "Embed device mockups (iPhone/Android) on your screenshots.",
      polafiy: "Retro-style Polaroid frames and instant photo generation.",
      palette: "Extract gorgeous color palettes from images automatically or manually.",
      gradio: "Design vivid CSS & React Native gradients with interactive tools.",
      iconset: "Generate and zip complete AppIcon assets for iOS and Android.",
      deeplink: "Test deep link routing directly inside iOS/Android simulators.",
      splashgen: "Generate compliant mobile splash screens in all design sizes.",
      base64: "Convert images to Base64 URI strings and decode Base64 back to images.",
      jsondiff: "Compare structures and highlight differences between two JSON structures.",
      img2pdf: "Compile multiple images into a single high-quality PDF document.",
      esign: "Create digital signatures by drawing or typing — download transparent PNG.",
      bgremove: "Remove image backgrounds instantly with AI — no API key, runs in-browser.",
      qrcode: "Generate custom QR codes with multiple styles, colors, and brand logos.",
      timestamp: "Convert Unix timestamps to human-readable dates and back, with timezone support."
    },
    // Base64 tool
    base64: {
      title: "base64",
      desc: "Quickly encode your images into Base64 URI strings for inline HTML/CSS usage, or decode Base64 strings back into previewable images.",
      modeEncode: "Image to Base64 (Encode)",
      modeDecode: "Base64 to Image (Decode)",
      chooseImage: "Choose an image to encode",
      dragAndDrop: "drag & drop or click to browse",
      outputTitle: "Base64 Encoding Result",
      outputSubtitle: "Character string ready for inline use",
      outputPlaceholder: "Base64 string will appear here after you upload an image.",
      inputPlaceholder: "Paste Base64 string here to decode...",
      decodeResult: "Decoded Image Result",
      decodeSubtitle: "Preview and download your decoded image",
      decodePlaceholder: "Decoded image will appear here.",
      downloadImage: "Download Image",
      copySuccess: "Copied to clipboard!",
      copyButton: "Copy"
    },
    // Palette tool
    palette: {
      title: "palette",
      desc: "Extract intelligent color palettes from any image automatically, or manually pick colors with an on-screen eye dropper.",
      tabAuto: "Auto Extract",
      tabManual: "Eye Dropper",
      chooseImage: "Choose image to extract colors",
      dragAndDrop: "drag & drop or click to upload",
      autoTitle: "Automatic Palette",
      autoDesc: "Dominant color tones extracted from the image.",
      manualTitle: "Manual Palette",
      manualDesc: "Move mouse and click on the image to sample colors.",
      eyedropperNotSupported: "EyeDropper API is not supported by your browser. Please use Auto extraction or Chrome/Edge/Safari.",
      copySuccess: "Copied color code",
      loading: "Loading image..."
    },
    // Gradio tool
    gradio: {
      title: "gradio",
      desc: "Design vibrant gradients, export css code and React Native styling with a few intuitive drag-and-drop actions.",
      tabEditor: "Gradient Editor",
      tabPresets: "Presets Palette",
      direction: "Gradient Direction",
      colorStart: "Start Color",
      colorEnd: "End Color",
      cssCode: "CSS Gradient Code",
      rnCode: "React Native Styles",
      previewTitle: "Gradient Preview",
      copySuccess: "Copied gradient code!"
    },
    // Iconset tool
    iconset: {
      title: "iconset",
      desc: "Automatically slice and package complete AppIcon assets for iOS and Android projects using a single 1024x1024 base image.",
      uploadTitle: "Upload Source Image",
      chooseImage: "Choose 1024x1024 logo (PNG)",
      dragAndDrop: "drag & drop your logo image here",
      platformTitle: "Export Platforms",
      iosLabel: "iOS AppIcon Asset (AppIcon.appiconset)",
      androidLabel: "Android mipmap folder layout",
      btnGenerate: "Generate & Download AppIcon (.zip)",
      generateSuccess: "Icon set generated successfully! Downloading...",
      invalidImage: "Please upload a valid PNG image."
    }
  }
};
