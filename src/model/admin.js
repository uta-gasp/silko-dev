import School from '@/model/school.js';

import db from '@/db/db.js';

export default class Admin {

  constructor() {
    this.name = 'Admin';
  }

  static get isLogged() {
    return db.user && db.user.isAdmin;
  }

  static createSchool( name, email, cb ) {
    db.add( School, {
      name: name,
      email: email,
      teachers: {},
      students: {},
    }, ( err, id ) => {
      cb( err, id );
    } );
  }

  static moveStudent( student, newSchoolID, schools ) {
    Admin.move( student, newSchoolID, schools, 'students' );
  }

  static moveTeacher( teacher, newSchoolID, schools ) {
    Admin.move( teacher, newSchoolID, schools, 'teachers' );
  }

  static move( user, newSchoolID, schools, list ) {
    const prevSchoolID = user.school;
    user.school = newSchoolID;

    db.updateField( user, 'school', newSchoolID, err => {
      if ( err ) {
        user.school = prevSchoolID;
        return console.error( err ); // TODO handle error
      }

      const prevSchool = schools.find( school => school.id === prevSchoolID );
      const newSchool = schools.find( school => school.id === newSchoolID );

      delete prevSchool[ list ][ user.id ];
      newSchool[ list ][ user.id ] = user.name;

      db.updateField( newSchool, `${list}/${user.id}`, user.name, err => {
        if ( err ) {
          return console.error( err ); // TODO handle error
        }

        db.deleteField( prevSchool, `${list}/${user.id}`, err => {
          if ( err ) {
            return console.error( err ); // TODO handle error
          }
        } );
      } );
    } );
  }

};
