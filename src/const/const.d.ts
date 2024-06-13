interface MeshPhongMaterialConfig {
  transparent: boolean;
  color: string;
  opacity: number;
}

export interface WorldGlobeConfig {
  animationDuration: number;
  movementOffset: number;
  zoomOffset: number;
  pointsMerge: boolean;
  animateIn: boolean;
  showAtmosphere: boolean;
  backgroundColor: string;
  hexagonPolygonColor: string;
  meshPhongMaterialConfig: MeshPhongMaterialConfig;
}

export interface SeoMetadata {
  title: string;
  description: string;
  robots?: {
    index?: boolean;
    follow?: boolean;
  }
}