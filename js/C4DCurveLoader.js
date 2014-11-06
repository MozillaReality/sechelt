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

			// [ point1, point2, point3, point4, ... ]

			var point1 = new THREE.Vector3();
			var point2 = new THREE.Vector3();

			return {

				getPointAt: function ( t ) {

					if ( t <= 0 ) return points[ 0 ].clone();
					if ( t >= 1 ) return points[ points.length - 1 ].clone();

					var key = t * ( points.length - 1 );
					var keyFloor = Math.floor( key );

					var weight = key - keyFloor;

					point1.copy( points[ keyFloor + 0 ] );
					point2.copy( points[ keyFloor + 1 ] );

					return new THREE.Vector3().copy( point1 ).lerp( point2, weight );

				},

				getPoints: function () {

					return points;

				}

			}

		};

		var BezierCurve = function ( points ) {

			// [ point1, anchor1b, anchor2a, point2, anchor2b, anchor3a, point3, ... ]

			var point1 = new THREE.Vector3();
			var point2 = new THREE.Vector3();
			var point3 = new THREE.Vector3();
			var point4 = new THREE.Vector3();

			var B1 = function ( t ) { return t * t * t };
			var B2 = function ( t ) { return 3 * t * t * ( 1 - t ) };
			var B3 = function ( t ) { return 3 * t * ( 1 - t ) * ( 1 - t ) };
			var B4 = function ( t ) { return ( 1 - t ) * ( 1 - t ) * ( 1 - t ) };

			return {

				getPointAt: function ( t ) {

					if ( t <= 0 ) return points[ 0 ].clone();
					if ( t >= 1 ) return points[ points.length - 1 ].clone();

					var key = t * Math.floor( points.length / 4 );
					var keyFloor = Math.floor( key );

					var weight = 1 - ( key - keyFloor );

					point1.copy( points[ keyFloor * 4 + 0 ] ).multiplyScalar( B1( weight ) );
					point2.copy( points[ keyFloor * 4 + 1 ] ).multiplyScalar( B2( weight ) );
					point3.copy( points[ keyFloor * 4 + 2 ] ).multiplyScalar( B3( weight ) );
					point4.copy( points[ keyFloor * 4 + 3 ] ).multiplyScalar( B4( weight ) );

					return new THREE.Vector3().add( point1 ).add( point2 ).add( point3 ).add( point4 );

				},

				getPoints: function () {

					return points;

				},

				toLinearCurve: function ( separation ) {

					var prevPoint = this.getPointAt( 0 );
					var newPoints = [ prevPoint ];
					var distance = 0;

					for ( var i = 1; i < 10000; i ++ ) {

						var point = this.getPointAt( i / 10000 );
						distance += prevPoint.distanceTo( point );

						if ( distance > separation ) {

							newPoints.push( point );
							distance = 0;

						}

						prevPoint = point;

					}

					/*
					var pointsAmount = points.length / 4;
					var segmentSize = 1 / pointsAmount;

					for ( var i = 0, il = points.length; i < il; i += 4 ) {

						distance = 0;

						distance += points[ i + 0 ].distanceTo( points[ i + 1 ] );
						distance += points[ i + 1 ].distanceTo( points[ i + 2 ] );
						distance += points[ i + 2 ].distanceTo( points[ i + 3 ] );

						var segment = i / il;

						for ( var j = 0, jl = distance / separation; j < jl; j ++ ) {

							var point = this.getPointAt( segment + ( j / jl ) * segmentSize );
							array.push( point );

						}

					}
					*/

					return new LinearCurve( newPoints );

				}

			}

		};

		var lines = text.split( '\r' );

		if ( /Point\tX\tY\tZ\t<- X\t<- Y\t<- Z\tX ->\tY ->\tZ ->/.test( lines[ 0 ] ) ) {

			var points = [];

			for ( var i = 1, l = lines.length - 1; i < l; i ++ ) {

				var parts = lines[ i ].split( '\t' );

				if ( i === 1 ) {

					// first point

					points.push(

						new THREE.Vector3(
							parseFloat( parts[ 1 ] ),
							parseFloat( parts[ 2 ] ),
							parseFloat( parts[ 3 ] )
						),

						new THREE.Vector3(
							parseFloat( parts[ 1 ] ) + parseFloat( parts[ 7 ] ),
							parseFloat( parts[ 2 ] ) + parseFloat( parts[ 8 ] ),
							parseFloat( parts[ 3 ] ) + parseFloat( parts[ 9 ] )
						)

					);

				} else if ( i === l - 1 ) {

					// last point

					points.push(

						new THREE.Vector3(
							parseFloat( parts[ 1 ] ) + parseFloat( parts[ 4 ] ),
							parseFloat( parts[ 2 ] ) + parseFloat( parts[ 5 ] ),
							parseFloat( parts[ 3 ] ) + parseFloat( parts[ 6 ] )
						),

						new THREE.Vector3(
							parseFloat( parts[ 1 ] ),
							parseFloat( parts[ 2 ] ),
							parseFloat( parts[ 3 ] )
						)

					);


				} else {

					points.push(

						new THREE.Vector3(
							parseFloat( parts[ 1 ] ) + parseFloat( parts[ 4 ] ),
							parseFloat( parts[ 2 ] ) + parseFloat( parts[ 5 ] ),
							parseFloat( parts[ 3 ] ) + parseFloat( parts[ 6 ] )
						),

						new THREE.Vector3(
							parseFloat( parts[ 1 ] ),
							parseFloat( parts[ 2 ] ),
							parseFloat( parts[ 3 ] )
						),

						new THREE.Vector3(
							parseFloat( parts[ 1 ] ),
							parseFloat( parts[ 2 ] ),
							parseFloat( parts[ 3 ] )
						),

						new THREE.Vector3(
							parseFloat( parts[ 1 ] ) + parseFloat( parts[ 7 ] ),
							parseFloat( parts[ 2 ] ) + parseFloat( parts[ 8 ] ),
							parseFloat( parts[ 3 ] ) + parseFloat( parts[ 9 ] )
						)

					);

				}

			}

			return new BezierCurve( points );

		} else if ( /Point\tX\tY\tZ/.test( lines[ 0 ] ) ) {

			var points = [];

			for ( var i = 1; i < lines.length - 1; i ++ ) {

				var parts = lines[ i ].split( '\t' );

				points.push(
					new THREE.Vector3(
						parseFloat( parts[ 1 ] ),
						parseFloat( parts[ 2 ] ),
						parseFloat( parts[ 3 ] )
					)
				);

			}

			return new LinearCurve( points );

		}

	}

};
