interface MunicipalityFees {
  [key: string]: number;
}

interface RegionData {
  range: string;
  municipalities: MunicipalityFees;
}

interface ShippingFees {
  [key: string]: RegionData;
}

export const shippingFees: ShippingFees = {
  "Nearby": {
    range: "₱80–₱120",
    municipalities: {
      "Aguilar": 80,
      "Bugallon": 100,
      "Binmaley": 120,
      "Labrador": 120,
    },
  },
  "Mid-West Pangasinan": {
    range: "₱130–₱180",
    municipalities: {
      "Lingayen": 150,
      "Calasiao": 170,
      "Mangaldan": 170,
      "San Fabian": 180,
      "San Carlos City": 150,
    },
  },
  "Central Pangasinan": {
    range: "₱190–₱230",
    municipalities: {
      "Dagupan City": 200,
      "Malasiqui": 200,
      "Bayambang": 220,
      "Basista": 200,
      "Santa Barbara": 220,
    },
  },
  "Eastern / Southern Pangasinan": {
    range: "₱240–₱300",
    municipalities: {
      "Urdaneta City": 250,
      "Binalonan": 260,
      "Pozorrubio": 260,
      "Rosales": 280,
      "Villasis": 260,
      "Asingan": 300,
    },
  },
  "Far West / Coastal / Mountain Areas": {
    range: "₱300–₱380",
    municipalities: {
      "Alaminos City": 320,
      "Bolinao": 380,
      "Anda": 360,
      "Bani": 300,
      "Mabini": 300,
      "Dasol": 350,
      "Infanta": 350,
      "Burgos": 340,
    },
  },
  "Far East / Border Municipalities": {
    range: "₱320–₱400",
    municipalities: {
      "Tayug": 350,
      "San Quintin": 330,
      "San Manuel": 330,
      "San Nicolas": 340,
      "Umingan": 400,
      "Natividad": 350,
      "Laoac": 330,
    },
  },
  "Other Municipalities": {
    range: "₱200–₱300 range",
    municipalities: {
      "Agno": 200,
      "Alcala": 240,
      "Anda": 360,
      "Balungao": 280,
      "Bautista": 250,
      "Mangatarem": 220,
      "Mapandan": 240,
      "Manaoag": 260,
      "San Jacinto": 240,
      "Santa Maria": 260,
      "Santo Tomas": 260,
      "Sison": 280,
      "Sual": 220,
      "Urbiztondo": 220,
    },
  },
};

export function getShippingFee(
  region: string,
  municipality: string,
): number | undefined {
  const regionData = shippingFees[region];
  if (regionData) {
    return regionData.municipalities[municipality];
  }
  return undefined;
}