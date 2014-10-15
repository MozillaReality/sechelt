/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.C4DCurveLoader = function ( manager ) {

	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

THREE.C4DCurveLoader.prototype = {

	constructor: THREE.C4DCurveLoader,

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var loader = new THREE.XHRLoader( scope.manager );
		loader.setCrossOrigin( this.crossOrigin );
		loader.load( url, function ( text ) {

			onLoad( scope.parse( text ) );

		} );

	},

	parse: function ( text ) {

		var LinearCurve = function ( points ) {

			var length = points.length / 3;

			var pointA = new THREE.Vector3();
			var pointB = new THREE.Vector3();

			return {

				getPointAt: function ( t ) {

					if ( t <= 0 ) return new THREE.Vector3( points[ 0 ], points[ 1 ], points[ 2 ] );
					if ( t >= 1 ) return new THREE.Vector3( points[ points.length - 3 ], points[ points.length - 2 ], points[ points.length - 1 ] );

					var key = t * length;
					var keyFloor = Math.floor( key );

					var keyA = keyFloor * 3;
					var keyB = keyA + 3;

					pointA.set( points[ keyA + 0 ], points[ keyA + 1 ], points[ keyA + 2 ] );
					pointB.set( points[ keyB + 0 ], points[ keyB + 1 ], points[ keyB + 2 ] );

					return new THREE.Vector3().copy( pointA ).lerp( pointB, key - keyFloor );

				}

			}

		};
		
		var BezierCurve = function ( points ) {

			var length = points.length / 9;

			var pointA = new THREE.Vector3();
			var pointB = new THREE.Vector3();

			var anchorA = new THREE.Vector3();
			var anchorB = new THREE.Vector3();

			return {
			
				getPointAt: function ( t ) {
				
					return new THREE.Vector3();
				
				}
			
			}
		
		};

		var lines = text.split( '\r' );
		
		if ( /Point\tX\tY\tZ\t<- X\t<- Y\t<- Z\tX ->\tY ->\tZ ->/.test( lines[ 0 ] ) ) {

			var points = [];

			for ( var i = 1; i < lines.length - 1; i ++ ) {

				var parts = lines[ i ].split( '\t' );

				points.push(
					parseFloat( parts[ 1 ] ),
					parseFloat( parts[ 2 ] ),
					parseFloat( parts[ 3 ] ),

					parseFloat( parts[ 4 ] ),
					parseFloat( parts[ 5 ] ),
					parseFloat( parts[ 6 ] ),

					parseFloat( parts[ 7 ] ),
					parseFloat( parts[ 8 ] ),
					parseFloat( parts[ 9 ] )
				);

			}

			return new BezierCurve( points );
			
		} else if ( /Point\tX\tY\tZ/.test( lines[ 0 ] ) ) {

			var points = [];

			for ( var i = 1; i < lines.length - 1; i ++ ) {

				var parts = lines[ i ].split( '\t' );

				points.push(
					parseFloat( parts[ 1 ] ),
					parseFloat( parts[ 2 ] ),
					parseFloat( parts[ 3 ] )
				);

			}

			return new LinearCurve( points );

		}

	}

};
