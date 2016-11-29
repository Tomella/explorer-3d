
export class Shaders {
   public static VertexShader = {
      COLOR_RAMP:
      "attribute vec3 customColor;\n" +
      "varying vec3 vColor;\n" +
      "void main() {\n" +
      "	vColor = customColor;\n" +
      "	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n" +
      "}"
   };

   public static FragmentShader = {
      COLOR_RAMP:
      "uniform vec3 color;\n\n" +
      "varying vec3 vColor;\n" +
      "void main() {\n" +
      "	gl_FragColor = vec4( vColor * color, 1 );\n" +
      "}"
   };

   public static add(key: string, holder?: any) {
      holder = holder ? holder : {};
      holder.vertexShader = this.VertexShader[key];
      holder.fragmentShader = this.FragmentShader[key];
      return holder;
   }
}
