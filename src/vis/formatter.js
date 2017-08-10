function formatTimeComponent( timeComponent ) {
  let formattedTimeComponent = '' + timeComponent;
  if ( formattedTimeComponent.length < 2 ) {
    formattedTimeComponent = '0' + formattedTimeComponent;
  }
  return formattedTimeComponent;
}

export default class Formatter {

    static sessionDate( dateString ) {
      const date = new Date( dateString );
      const hours = formatTimeComponent( date.getHours() );
      const minutes = formatTimeComponent( date.getMinutes() );
      return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()} ${hours}:${minutes} `;
    }

};
