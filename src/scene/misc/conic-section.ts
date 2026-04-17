import * as THREE from "three";
import { degreesToRadians } from "../../physics/utils/misc";
import { VectorType } from "../../types/physics";

class ConicSection {
  private uniforms: {
    aX: { value: number };
    aY: { value: number };
    xRadius: { value: number };
    yRadius: { value: number };
    aStartAngle: { value: number };
    aEndAngle: { value: number };
    aClockwise: { value: boolean };
    aRotation: { value: number };
    e: { value: number };
  };
  private verticesNumber: number;
  private vertices: THREE.Vector3[];
  private verticesIndices: Float32Array;
  private color: string;

  public object3D: THREE.Object3D;

  public conicSection: THREE.Line;

  constructor(
    aX: number,
    aY: number,
    xRadius: number,
    yRadius: number,
    aStartAngle: number,
    aEndAngle: number,
    aClockwise: boolean,
    aRotation: number,
    verticesNumber: number,
    color: string,
    e: number = 0,
  ) {
    this.verticesNumber = verticesNumber;

    this.vertices = [];
    this.verticesIndices = new Float32Array(verticesNumber);

    this.color = color;

    this.uniforms = {
      aX: { value: aX },
      aY: { value: aY },
      xRadius: { value: xRadius },
      yRadius: { value: yRadius },
      aStartAngle: { value: aStartAngle },
      aEndAngle: { value: aEndAngle },
      aClockwise: { value: aClockwise },
      aRotation: { value: aRotation },
      e: { value: e },
    };

    this.object3D = new THREE.Object3D();

    const vector = new THREE.Vector3();

    for (let i = 0; i < verticesNumber; i++) {
      this.vertices.push(vector);
      this.verticesIndices[i] = i;
    }

    const conicSectionGeometry = new THREE.BufferGeometry().setFromPoints(
      this.vertices,
    );

    conicSectionGeometry.setAttribute(
      "vertIndex",
      new THREE.Float32BufferAttribute(this.verticesIndices, 1),
    );

    const conicSectionMaterial = new THREE.LineBasicMaterial({
      color: this.color,
    });

    conicSectionMaterial.onBeforeCompile = (shader: any) => {
      shader.uniforms.aX = this.uniforms.aX;
      shader.uniforms.aY = this.uniforms.aY;
      shader.uniforms.xRadius = this.uniforms.xRadius;
      shader.uniforms.yRadius = this.uniforms.yRadius;
      shader.uniforms.aStartAngle = this.uniforms.aStartAngle;
      shader.uniforms.aEndAngle = this.uniforms.aEndAngle;
      shader.uniforms.aClockwise = this.uniforms.aClockwise;
      shader.uniforms.aRotation = this.uniforms.aRotation;
      shader.uniforms.e = this.uniforms.e;
      shader.uniforms.vertCount = { value: this.verticesNumber };

      shader.vertexShader = `
          uniform float aX;
          uniform float aY;
          uniform float xRadius;
          uniform float yRadius;
          uniform float aStartAngle;
          uniform float aEndAngle;
          uniform float aClockwise;
          uniform float aRotation;
          uniform float e;
        
          uniform float vertCount;
        
          attribute float vertIndex;

          float myCosh(float x) { return (exp(x) + exp(-x)) * 0.5; }
          float mySinh(float x) { return (exp(x) - exp(-x)) * 0.5; }

          vec3 getPoint(float t){
            vec3 point = vec3(0);
            float x = aX;
            float y = aY;

            if (e < 1.0) {
              float eps = 0.00001;
              float twoPi = 3.1415926 * 2.0;
              float deltaAngle = aEndAngle - aStartAngle;
              bool samePoints = abs( deltaAngle ) < eps;

              if (deltaAngle < eps) deltaAngle = samePoints ? 0.0 : twoPi;
              if ( floor(aClockwise + 0.5) == 1.0 && ! samePoints ) deltaAngle = deltaAngle == twoPi ? - twoPi : deltaAngle - twoPi;

              float angle = aStartAngle + t * deltaAngle;
              x = aX + xRadius * cos( angle );
              y = aY + yRadius * sin( angle );
            } else {
              float tParam = aStartAngle + t * (aEndAngle - aStartAngle);
              x = aX + xRadius * myCosh(tParam);
              y = aY + yRadius * mySinh(tParam);
            }
        
            if ( aRotation != 0. ) {
      
                float c = cos( aRotation );
                float s = sin( aRotation );
      
                float tx = x - aX;
                float ty = y - aY;
      
                x = tx * c - ty * s + aX;
                y = tx * s + ty * c + aY;
      
            }
            point.x = x;
            point.y = y;
            return point;
          }
          ${shader.vertexShader}`;

      shader.vertexShader = shader.vertexShader.replace(
        `#include <begin_vertex>`,
        `#include <begin_vertex>
            float t = vertIndex / vertCount;
            transformed = getPoint(t);
            `,
      );
    };

    conicSectionMaterial.depthWrite = false;

    this.conicSection = new THREE.Line(
      conicSectionGeometry,
      conicSectionMaterial,
    );
    this.conicSection.frustumCulled = false;
    this.conicSection.name = "conicSection";

    this.object3D.add(this.conicSection);
  }

  private rotateAroundFocus(axisRotations: VectorType): void {
    this.conicSection.rotation.z = degreesToRadians(axisRotations.z);
    this.conicSection.rotation.x = degreesToRadians(axisRotations.x);

    //No can do ZXZ rotations, so we rotate the z axis of the parent object
    //of the conic instead to give the conic the correct orientation in 3D space around
    //its focus

    this.object3D.rotation.z = degreesToRadians(axisRotations.y);
  }

  public update(
    aX: number,
    aY: number,
    xRadius: number,
    yRadius: number,
    aStartAngle: number,
    aEndAngle: number,
    aClockwise: boolean,
    aRotation: number,
    e: number,
    axisRotations: VectorType,
  ): void {
    this.uniforms.aX.value = aX;
    this.uniforms.aY.value = aY;
    this.uniforms.xRadius.value = xRadius;
    this.uniforms.yRadius.value = yRadius;
    this.uniforms.aStartAngle.value = aStartAngle;
    this.uniforms.aEndAngle.value = aEndAngle;
    this.uniforms.aClockwise.value = aClockwise;
    this.uniforms.aRotation.value = aRotation;
    this.uniforms.e.value = e;

    this.rotateAroundFocus(axisRotations);
  }

  public dispose(): void {
    const conicSection = this.conicSection;

    const geometry = conicSection.geometry;

    geometry.dispose();

    const material = conicSection.material as THREE.LineBasicMaterial;

    material.dispose();

    this.object3D.remove(conicSection);
  }
}

export default ConicSection;
