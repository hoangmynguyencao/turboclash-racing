/**
 * Định nghĩa 10 Màn chơi (10 Levels) với độ khó tăng dần
 */
window.GAME_LEVELS = [
    {
        level: 1,
        title: "Level 1: Cao Tốc Khởi Động",
        subtitle: "Beginner Highway - 4 Làn Xe Rộng Rãi",
        distance: 1200,
        lanes: 4,
        roadWidth: 500,
        curveIntensity: 0.2,
        speedLimit: 170,
        theme: {
            skyColor: "#38bdf8",
            horizonColor: "#bae6fd",
            grassColor: "#22c55e",
            grassStripe: "#16a34a",
            roadColor: "#334155",
            roadStripe: "#f8fafc",
            curbColor1: "#ef4444",
            curbColor2: "#ffffff",
            weather: "clear", // clear, sunset, night, rain, sandstorm, fog, storm, inferno
            ambientLight: 1.0
        },
        obstacles: [
            { type: 'cone', weight: 4 },
            { type: 'car_civilian', weight: 3 },
            { type: 'boost_pad', weight: 2 },
            { type: 'nitro_pickup', weight: 2 }
        ],
        obstacleCount: 16,
        description: "Làm quen với tốc độ và khả năng bẻ lái. Đường đua thẳng, ít chướng ngại vật."
    },
    {
        level: 2,
        title: "Level 2: Đại Lộ Ven Biển",
        subtitle: "Coastal Boulevard - Khúc Cua Nhẹ & Gió Biển",
        distance: 1500,
        lanes: 4,
        roadWidth: 480,
        curveIntensity: 0.4,
        speedLimit: 185,
        theme: {
            skyColor: "#f97316",
            horizonColor: "#fdba74",
            grassColor: "#eab308",
            grassStripe: "#ca8a04",
            roadColor: "#334155",
            roadStripe: "#f8fafc",
            curbColor1: "#3b82f6",
            curbColor2: "#ffffff",
            weather: "sunset",
            ambientLight: 0.95
        },
        obstacles: [
            { type: 'cone', weight: 3 },
            { type: 'car_civilian', weight: 4 },
            { type: 'barrier', weight: 2 },
            { type: 'boost_pad', weight: 2 },
            { type: 'nitro_pickup', weight: 2 }
        ],
        obstacleCount: 22,
        description: "Mặt đường xuất hiện rào chắn công trình và xe cộ di chuyển nhiều hơn."
    },
    {
        level: 3,
        title: "Level 3: Vực Dầu Trơn Trượt",
        subtitle: "Oil Slick Alley - Cẩn Thận Mất Lái!",
        distance: 1800,
        lanes: 3,
        roadWidth: 440,
        curveIntensity: 0.6,
        speedLimit: 200,
        theme: {
            skyColor: "#6366f1",
            horizonColor: "#a5b4fc",
            grassColor: "#475569",
            grassStripe: "#334155",
            roadColor: "#1e293b",
            roadStripe: "#cbd5e1",
            curbColor1: "#eab308",
            curbColor2: "#0f172a",
            weather: "overcast",
            ambientLight: 0.85
        },
        obstacles: [
            { type: 'oil_slick', weight: 5 }, // Cán trúng bị trượt drift mất lái
            { type: 'car_civilian', weight: 4 },
            { type: 'barrier', weight: 3 },
            { type: 'boost_pad', weight: 2 },
            { type: 'wrench_pickup', weight: 2 },
            { type: 'nitro_pickup', weight: 2 }
        ],
        obstacleCount: 28,
        description: "Mặt đường bị loang dầu bôi trơn. Cán phải dầu sẽ bị mất lái trượt xoay vòng!"
    },
    {
        level: 4,
        title: "Level 4: Bão Cát Sa Mạc",
        subtitle: "Desert Dunes - Hãm Lực Cát & Gió Nóng",
        distance: 2000,
        lanes: 3,
        roadWidth: 420,
        curveIntensity: 0.5,
        speedLimit: 210,
        theme: {
            skyColor: "#d97706",
            horizonColor: "#fde68a",
            grassColor: "#d97706",
            grassStripe: "#b45309",
            roadColor: "#451a03",
            roadStripe: "#fef08a",
            curbColor1: "#f59e0b",
            curbColor2: "#78350f",
            weather: "sandstorm",
            ambientLight: 0.9
        },
        obstacles: [
            { type: 'sand_trap', weight: 5 }, // Bẫy cát làm giảm tốc độ mạnh
            { type: 'car_civilian', weight: 4 },
            { type: 'cone', weight: 3 },
            { type: 'boost_pad', weight: 3 },
            { type: 'nitro_pickup', weight: 2 }
        ],
        obstacleCount: 34,
        description: "Bão cát làm giảm tầm nhìn. Gò cát tích tụ trên đường sẽ hãm tốc độ cực gắt."
    },
    {
        level: 5,
        title: "Level 5: Giờ Cao Điểm Đô Thị",
        subtitle: "Rush Hour Chaos - Mật Độ Xe Dày Đặc",
        distance: 2200,
        lanes: 4,
        roadWidth: 460,
        curveIntensity: 0.7,
        speedLimit: 220,
        theme: {
            skyColor: "#0284c7",
            horizonColor: "#38bdf8",
            grassColor: "#15803d",
            grassStripe: "#166534",
            roadColor: "#1e293b",
            roadStripe: "#f8fafc",
            curbColor1: "#ef4444",
            curbColor2: "#ffffff",
            weather: "clear",
            ambientLight: 1.0
        },
        obstacles: [
            { type: 'car_civilian', weight: 9 }, // Rất nhiều xe cộ chuyển làn
            { type: 'barrier', weight: 4 },
            { type: 'oil_slick', weight: 3 },
            { type: 'boost_pad', weight: 3 },
            { type: 'wrench_pickup', weight: 3 },
            { type: 'nitro_pickup', weight: 3 }
        ],
        obstacleCount: 42,
        description: "Đại lộ đông đúc phương tiện giao thông. Phải luồn lách liên tục để bứt phá!"
    },
    {
        level: 6,
        title: "Level 6: Đêm Sương Mù Neon",
        subtitle: "Midnight Fog - Tầm Nhìn Hạn Chế",
        distance: 2400,
        lanes: 3,
        roadWidth: 420,
        curveIntensity: 0.8,
        speedLimit: 230,
        theme: {
            skyColor: "#090d16",
            horizonColor: "#1e1b4b",
            grassColor: "#0f172a",
            grassStripe: "#020617",
            roadColor: "#111827",
            roadStripe: "#00f0ff", // Neon Cyan
            curbColor1: "#ff007f", // Neon Pink
            curbColor2: "#00f0ff",
            weather: "fog",
            ambientLight: 0.45
        },
        obstacles: [
            { type: 'pothole', weight: 5 }, // Hố ga hỏng khó thấy
            { type: 'car_civilian', weight: 5 },
            { type: 'barrier', weight: 4 },
            { type: 'boost_pad', weight: 3 },
            { type: 'nitro_pickup', weight: 3 }
        ],
        obstacleCount: 48,
        description: "Đua xe trong đêm sương mù dày đặc. Hãy dựa vào vạch kẻ đường Neon và đèn pha!"
    },
    {
        level: 7,
        title: "Level 7: Đèo Núi Hiểm Trở",
        subtitle: "Mountain Hairpin - Đường Hẹp 2 Làn & Đá Lăn",
        distance: 2600,
        lanes: 2, // Chỉ có 2 làn xe!
        roadWidth: 320,
        curveIntensity: 1.1,
        speedLimit: 240,
        theme: {
            skyColor: "#475569",
            horizonColor: "#64748b",
            grassColor: "#334155",
            grassStripe: "#1e293b",
            roadColor: "#0f172a",
            roadStripe: "#fbbf24",
            curbColor1: "#dc2626",
            curbColor2: "#ffffff",
            weather: "overcast",
            ambientLight: 0.75
        },
        obstacles: [
            { type: 'boulder', weight: 6 }, // Đá tảng lăn ngang đèo
            { type: 'barrier', weight: 5 },
            { type: 'car_civilian', weight: 4 },
            { type: 'wrench_pickup', weight: 3 },
            { type: 'nitro_pickup', weight: 3 }
        ],
        obstacleCount: 52,
        description: "Đường đèo núi hẹp chỉ 2 làn xe với những khúc cua gấp. Đá tảng lăn chắn ngang lối đi!"
    },
    {
        level: 8,
        title: "Level 8: Bão Giông Sấm Sét",
        subtitle: "Thunderstorm Highway - Đường Trơn & Mưa Lớn",
        distance: 2800,
        lanes: 3,
        roadWidth: 420,
        curveIntensity: 0.9,
        speedLimit: 250,
        theme: {
            skyColor: "#0c1222",
            horizonColor: "#1e293b",
            grassColor: "#064e3b",
            grassStripe: "#022c22",
            roadColor: "#0f172a",
            roadStripe: "#38bdf8",
            curbColor1: "#38bdf8",
            curbColor2: "#ffffff",
            weather: "storm",
            ambientLight: 0.5
        },
        obstacles: [
            { type: 'water_puddle', weight: 6 }, // Vũng nước đọng gây trượt nước (Hydroplaning)
            { type: 'car_civilian', weight: 5 },
            { type: 'barrier', weight: 4 },
            { type: 'boost_pad', weight: 3 },
            { type: 'nitro_pickup', weight: 3 }
        ],
        obstacleCount: 56,
        description: "Mưa như trút nước và sấm chớp rạch ngang trời. Bánh xe mất 30% độ bám đường!"
    },
    {
        level: 9,
        title: "Level 9: Cảnh Sát Truy Cản & Rào Gai",
        subtitle: "Police Interceptor - Phong Tỏa Cao Tốc",
        distance: 3000,
        lanes: 3,
        roadWidth: 400,
        curveIntensity: 1.0,
        speedLimit: 260,
        theme: {
            skyColor: "#18181b",
            horizonColor: "#3f3f46",
            grassColor: "#27272a",
            grassStripe: "#18181b",
            roadColor: "#09090b",
            roadStripe: "#ef4444",
            curbColor1: "#3b82f6",
            curbColor2: "#ef4444",
            weather: "night",
            ambientLight: 0.6
        },
        obstacles: [
            { type: 'police', weight: 6 }, // Xe cảnh sát tuần tra chặn đầu
            { type: 'spike_strip', weight: 5 }, // Bẫy đinh rách lốp
            { type: 'barrier', weight: 5 },
            { type: 'boost_pad', weight: 3 },
            { type: 'wrench_pickup', weight: 3 },
            { type: 'nitro_pickup', weight: 3 }
        ],
        obstacleCount: 62,
        description: "Cảnh sát lập chốt phong tỏa với xe tuần tra cơ động và bẫy rải đinh sắc nhọn!"
    },
    {
        level: 10,
        title: "Level 10: Chung Kết Hỏa Ngục",
        subtitle: "Inferno Apex - Đỉnh Cao Tốc Độ 300 km/h!",
        distance: 3500,
        lanes: 3,
        roadWidth: 380,
        curveIntensity: 1.3,
        speedLimit: 300,
        theme: {
            skyColor: "#450a0a",
            horizonColor: "#b91c1c",
            grassColor: "#7f1d1d",
            grassStripe: "#450a0a",
            roadColor: "#1c1917",
            roadStripe: "#f97316", // Dung nham cam
            curbColor1: "#ef4444",
            curbColor2: "#f59e0b",
            weather: "inferno",
            ambientLight: 0.85
        },
        obstacles: [
            { type: 'fire_hazard', weight: 6 }, // Tia lửa & nham thạch
            { type: 'boulder', weight: 5 },
            { type: 'police', weight: 4 },
            { type: 'oil_slick', weight: 4 },
            { type: 'barrier', weight: 4 },
            { type: 'boost_pad', weight: 5 }, // Nhiều boost pad cho tốc độ xé gió
            { type: 'nitro_pickup', weight: 4 },
            { type: 'wrench_pickup', weight: 4 }
        ],
        obstacleCount: 75,
        description: "Đường đua đỉnh cao rực lửa! Kết hợp toàn bộ chướng ngại vật nguy hiểm nhất!"
    }
];
