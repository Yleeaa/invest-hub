/**
 * Shape Blur (Vanilla JS / Three.js)
 * 基于 reactbits.dev ShapeBlur 动画的原生实现
 * 依赖：three（通过 CDN 引入，window.THREE）
 *
 * 用法：
 *   <div id="shape-blur"></div>
 *   <script>
 *     mountShapeBlur('shape-blur', {
 *       variation: 0,
 *       shapeSize: 1.0,
 *       roundness: 0.5,
 *       borderSize: 0.08,
 *       circleSize: 0.3,
 *       circleEdge: 0.5,
 *       color: [0.788, 0.663, 0.380], // 金色
 *       pixelRatio: 2
 *     });
 *   </script>
 */
(function () {
    'use strict';

    if (typeof window === 'undefined' || !window.THREE) {
        console.warn('[ShapeBlur] THREE 未加载，跳过初始化');
        return;
    }

    var VERTEX_SHADER = [
        'varying vec2 v_texcoord;',
        'void main() {',
        '    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
        '    v_texcoord = uv;',
        '}'
    ].join('\n');

    var FRAGMENT_SHADER = [
        'varying vec2 v_texcoord;',
        'uniform vec2 u_mouse;',
        'uniform vec2 u_resolution;',
        'uniform float u_pixelRatio;',
        'uniform float u_shapeSize;',
        'uniform float u_roundness;',
        'uniform float u_borderSize;',
        'uniform float u_circleSize;',
        'uniform float u_circleEdge;',
        'uniform vec3 u_color;',
        '#ifndef PI',
        '#define PI 3.1415926535897932384626433832795',
        '#endif',
        '#ifndef TWO_PI',
        '#define TWO_PI 6.2831853071795864769252867665590',
        '#endif',
        '#ifndef VAR',
        '#define VAR 0',
        '#endif',
        '#ifndef FNC_COORD',
        '#define FNC_COORD',
        'vec2 coord(in vec2 p) {',
        '    p = p / u_resolution.xy;',
        '    if (u_resolution.x > u_resolution.y) {',
        '        p.x *= u_resolution.x / u_resolution.y;',
        '        p.x += (u_resolution.y - u_resolution.x) / u_resolution.y / 2.0;',
        '    } else {',
        '        p.y *= u_resolution.y / u_resolution.x;',
        '        p.y += (u_resolution.x - u_resolution.y) / u_resolution.x / 2.0;',
        '    }',
        '    p -= 0.5;',
        '    p *= vec2(-1.0, 1.0);',
        '    return p;',
        '}',
        '#endif',
        '#define st0 coord(gl_FragCoord.xy)',
        '#define mx coord(u_mouse * u_pixelRatio)',
        'float sdRoundRect(vec2 p, vec2 b, float r) {',
        '    vec2 d = abs(p - 0.5) * 4.2 - b + vec2(r);',
        '    return min(max(d.x, d.y), 0.0) + length(max(d, 0.0)) - r;',
        '}',
        'float sdCircle(in vec2 st, in vec2 center) {',
        '    return length(st - center) * 2.0;',
        '}',
        'float sdPoly(in vec2 p, in float w, in int sides) {',
        '    float a = atan(p.x, p.y) + PI;',
        '    float r = TWO_PI / float(sides);',
        '    float d = cos(floor(0.5 + a / r) * r - a) * length(max(abs(p) * 1.0, 0.0));',
        '    return d * 2.0 - w;',
        '}',
        'float aastep(float threshold, float value) {',
        '    float afwidth = length(vec2(dFdx(value), dFdy(value))) * 0.70710678118654757;',
        '    return smoothstep(threshold - afwidth, threshold + afwidth, value);',
        '}',
        'float fill(in float x) { return 1.0 - aastep(0.0, x); }',
        'float fill(float x, float size, float edge) {',
        '    return 1.0 - smoothstep(size - edge, size + edge, x);',
        '}',
        'float stroke(in float d, in float t) { return (1.0 - aastep(t, abs(d))); }',
        'float stroke(float x, float size, float w, float edge) {',
        '    float d = smoothstep(size - edge, size + edge, x + w * 0.5) - smoothstep(size - edge, size + edge, x - w * 0.5);',
        '    return clamp(d, 0.0, 1.0);',
        '}',
        'float strokeAA(float x, float size, float w, float edge) {',
        '    float afwidth = length(vec2(dFdx(x), dFdy(x))) * 0.70710678;',
        '    float d = smoothstep(size - edge - afwidth, size + edge + afwidth, x + w * 0.5)',
        '            - smoothstep(size - edge - afwidth, size + edge + afwidth, x - w * 0.5);',
        '    return clamp(d, 0.0, 1.0);',
        '}',
        'void main() {',
        '    vec2 st = st0 + 0.5;',
        '    float size = u_shapeSize;',
        '    float roundness = u_roundness;',
        '    float borderSize = u_borderSize;',
        '    float sdf;',
        '    if (VAR == 0) {',
        '        sdf = sdRoundRect(st, vec2(size), roundness);',
        '        sdf = strokeAA(sdf, 0.0, borderSize, 0.005) * 4.0;',
        '    } else if (VAR == 1) {',
        '        sdf = sdCircle(st, vec2(0.5));',
        '        sdf = fill(sdf, 0.6, 0.01) * 1.2;',
        '    } else if (VAR == 2) {',
        '        sdf = sdCircle(st, vec2(0.5));',
        '        sdf = strokeAA(sdf, 0.58, 0.02, 0.005) * 4.0;',
        '    } else if (VAR == 3) {',
        '        sdf = sdPoly(st - vec2(0.5, 0.45), 0.3, 3);',
        '        sdf = fill(sdf, 0.05, 0.01) * 1.4;',
        '    }',
        '    vec3 color = u_color;',
        '    float alpha = sdf;',
        '    gl_FragColor = vec4(color.rgb, alpha);',
        '}'
    ].join('\n');

    function mountShapeBlur(elementId, options) {
        options = options || {};
        var mount = document.getElementById(elementId);
        if (!mount) {
            console.warn('[ShapeBlur] 找不到 #' + elementId);
            return null;
        }
        if (!window.THREE) {
            console.warn('[ShapeBlur] THREE 未加载');
            return null;
        }

        var THREE = window.THREE;
        var variation = options.variation != null ? options.variation : 0;
        var pixelRatioProp = options.pixelRatio != null ? options.pixelRatio : 2;
        var shapeSize = options.shapeSize != null ? options.shapeSize : 1.0;
        var roundness = options.roundness != null ? options.roundness : 0.5;
        var borderSize = options.borderSize != null ? options.borderSize : 0.08;
        var circleSize = options.circleSize != null ? options.circleSize : 0.3;
        var circleEdge = options.circleEdge != null ? options.circleEdge : 0.5;
        var colorArr = options.color || [0.788, 0.663, 0.380]; // 默认金色 #c9a961

        var vMouse = new THREE.Vector2(0, 0);
        var vMouseDamp = new THREE.Vector2(0, 0);
        var vResolution = new THREE.Vector2(1, 1);

        var scene = new THREE.Scene();
        var camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
        camera.position.z = 1;

        var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setClearColor(0x000000, 0);
        renderer.domElement.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;display:block;';
        mount.appendChild(renderer.domElement);

        var geo = new THREE.PlaneGeometry(2, 2);
        var material = new THREE.ShaderMaterial({
            vertexShader: VERTEX_SHADER,
            fragmentShader: FRAGMENT_SHADER,
            uniforms: {
                u_mouse: { value: vMouseDamp },
                u_resolution: { value: vResolution },
                u_pixelRatio: { value: pixelRatioProp },
                u_shapeSize: { value: shapeSize },
                u_roundness: { value: roundness },
                u_borderSize: { value: borderSize },
                u_circleSize: { value: circleSize },
                u_circleEdge: { value: circleEdge },
                u_color: { value: new THREE.Vector3(colorArr[0], colorArr[1], colorArr[2]) }
            },
            defines: { VAR: variation },
            transparent: true
        });

        var quad = new THREE.Mesh(geo, material);
        scene.add(quad);

        function onPointerMove(e) {
            var rect = mount.getBoundingClientRect();
            vMouse.set(e.clientX - rect.left, e.clientY - rect.top);
        }
        document.addEventListener('mousemove', onPointerMove);
        document.addEventListener('pointermove', onPointerMove);

        var w = 1, h = 1;
        function resize() {
            w = mount.clientWidth || 1;
            h = mount.clientHeight || 1;
            var dpr = Math.min(window.devicePixelRatio || 1, pixelRatioProp);
            renderer.setSize(w, h, false);
            renderer.setPixelRatio(dpr);
            camera.left = -w / 2;
            camera.right = w / 2;
            camera.top = h / 2;
            camera.bottom = -h / 2;
            camera.updateProjectionMatrix();
            quad.scale.set(w / 2, h / 2, 1);
            vResolution.set(w, h).multiplyScalar(dpr);
            material.uniforms.u_pixelRatio.value = dpr;
        }
        resize();
        window.addEventListener('resize', resize);

        // 下一帧再调一次，确保布局完成
        requestAnimationFrame(resize);

        var ro = null;
        if (typeof ResizeObserver !== 'undefined') {
            ro = new ResizeObserver(resize);
            ro.observe(mount);
        }

        var time = 0, lastTime = 0, animationId = 0;
        function update() {
            animationId = requestAnimationFrame(update);
            time = performance.now() * 0.001;
            var dt = Math.max(0, time - lastTime);
            lastTime = time;
            vMouseDamp.x = THREE.MathUtils.damp(vMouseDamp.x, vMouse.x, 8, dt);
            vMouseDamp.y = THREE.MathUtils.damp(vMouseDamp.y, vMouse.y, 8, dt);
            renderer.render(scene, camera);
        }
        update();

        // 暴露销毁函数
        mount._shapeBlurDestroy = function () {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', resize);
            if (ro) ro.disconnect();
            document.removeEventListener('mousemove', onPointerMove);
            document.removeEventListener('pointermove', onPointerMove);
            if (renderer.domElement.parentNode) {
                renderer.domElement.parentNode.removeChild(renderer.domElement);
            }
            geo.dispose();
            material.dispose();
            renderer.dispose();
            renderer.forceContextLoss && renderer.forceContextLoss();
        };

        return mount._shapeBlurDestroy;
    }

    window.mountShapeBlur = mountShapeBlur;
})();
