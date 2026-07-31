/**
 * www.appogio.com -> appogio.com, con un 301 permanente.
 *
 * POR QUÉ: los dos nombres están dados de alta como dominio del proyecto en
 * Cloudflare Pages, así que los dos servían EL MISMO sitio con código 200
 * (comprobado el 31-jul-2026: el md5 de la portada era idéntico). Para un
 * buscador eso es el sitio entero duplicado en dos direcciones. Las etiquetas
 * canonical ya apuntaban todas a appogio.com, así que el daño estaba contenido,
 * pero lo correcto es que www no sirva nada: que redirija.
 *
 * POR QUÉ AQUÍ Y NO EN UNA REGLA DE CLOUDFLARE: la forma natural sería una
 * "Regla de redirección" en el panel de Cloudflare, pero el token que hay en el
 * servidor no tiene permiso sobre las reglas de la zona (da error 10000). Si
 * algún día se crea esa regla, este archivo se puede borrar.
 *
 * CUIDADO: este archivo hace que TODAS las peticiones del sitio pasen por aquí.
 * Todo lo que no sea www debe seguir de largo con `context.next()`, que es lo
 * que sirve el archivo estático de siempre. Si esto falla, el sitio entero
 * responde error: para volver atrás, borrar la carpeta `functions/` y publicar.
 */
export async function onRequest(context) {
  const url = new URL(context.request.url);

  if (url.hostname === 'www.appogio.com') {
    url.hostname = 'appogio.com';
    /* 301 = permanente: es lo que consolida las dos direcciones en una sola
       a ojos del buscador. Se conservan la ruta, la consulta y todo lo demás
       porque solo se cambia el nombre del servidor. */
    return Response.redirect(url.toString(), 301);
  }

  return context.next();
}
