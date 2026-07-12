<?xml version="1.0" encoding="UTF-8"?>
<!--
  Human-friendly rendering of sitemap.xml. Browsers apply this stylesheet when
  someone opens the sitemap; search engines ignore it and read the raw XML.
  Referenced from sitemap.xml via <?xml-stylesheet ...?> (added by build.js).
-->
<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9"
    xmlns:xhtml="http://www.w3.org/1999/xhtml">

  <xsl:output method="html" encoding="UTF-8" indent="yes" doctype-system="about:legacy-compat"/>

  <xsl:template match="/">
    <html lang="hr">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <meta name="robots" content="noindex"/>
        <title>XML Sitemap — Odvjetnik Jurica Gaćina</title>
        <style>
          :root { color-scheme: dark; }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            padding: 2.5rem 1.25rem;
            background: #0f1419;
            color: #e8e3d3;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            line-height: 1.6;
          }
          .wrap { max-width: 960px; margin: 0 auto; }
          h1 {
            margin: 0 0 0.25rem;
            font-size: 1.8rem;
            font-weight: 700;
            letter-spacing: 0.02em;
          }
          h1 .accent { color: #d4af37; }
          .sub { margin: 0 0 1.5rem; color: #a8a596; font-size: 0.95rem; }
          .sub a { color: #d4af37; }
          .count {
            display: inline-block;
            margin-bottom: 1.25rem;
            padding: 0.25rem 0.75rem;
            border: 1px solid #2a3340;
            border-radius: 999px;
            font-size: 0.85rem;
            color: #a8a596;
          }
          .count strong { color: #e8e3d3; }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.9rem;
            background: #1a2332;
            border: 1px solid #2a3340;
            border-radius: 8px;
            overflow: hidden;
          }
          thead th {
            text-align: left;
            padding: 0.75rem 1rem;
            background: #050810;
            color: #d4af37;
            font-weight: 600;
            font-size: 0.8rem;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            border-bottom: 1px solid #2a3340;
          }
          tbody td { padding: 0.7rem 1rem; border-bottom: 1px solid #2a3340; vertical-align: top; }
          tbody tr:last-child td { border-bottom: 0; }
          tbody tr:hover { background: #202b3d; }
          td.num { color: #6b7280; width: 2rem; }
          a.url { color: #e8e3d3; text-decoration: none; word-break: break-all; }
          a.url:hover { color: #d4af37; text-decoration: underline; }
          .langs { color: #a8a596; font-size: 0.8rem; }
          .muted { color: #a8a596; white-space: nowrap; }
          footer { margin-top: 1.5rem; color: #6b7280; font-size: 0.8rem; }
          @media (max-width: 600px) {
            .hide-sm { display: none; }
            body { padding: 1.5rem 1rem; }
          }
        </style>
      </head>
      <body>
        <div class="wrap">
          <h1>XML <span class="accent">Sitemap</span></h1>
          <p class="sub">
            Odvjetnik Jurica Gaćina — Poreč. This file lists the site's pages for search engines such as Google.
            <a href="https://www.sitemaps.org/protocol.html">About sitemaps</a>.
          </p>
          <p class="count"><strong><xsl:value-of select="count(s:urlset/s:url)"/></strong> URLs</p>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>URL</th>
                <th class="hide-sm">Languages</th>
                <th class="hide-sm">Last modified</th>
                <th class="hide-sm">Frequency</th>
                <th>Priority</th>
              </tr>
            </thead>
            <tbody>
              <xsl:for-each select="s:urlset/s:url">
                <tr>
                  <td class="num"><xsl:value-of select="position()"/></td>
                  <td>
                    <a class="url" href="{s:loc}"><xsl:value-of select="s:loc"/></a>
                  </td>
                  <td class="langs hide-sm">
                    <xsl:for-each select="xhtml:link">
                      <xsl:value-of select="@hreflang"/>
                      <xsl:if test="position() != last()">, </xsl:if>
                    </xsl:for-each>
                  </td>
                  <td class="muted hide-sm"><xsl:value-of select="s:lastmod"/></td>
                  <td class="muted hide-sm"><xsl:value-of select="s:changefreq"/></td>
                  <td class="muted"><xsl:value-of select="s:priority"/></td>
                </tr>
              </xsl:for-each>
            </tbody>
          </table>

          <footer>Generated by build.js • <a href="https://odvjetnik-gacina.hr/" style="color:#d4af37;text-decoration:none;">odvjetnik-gacina.hr</a></footer>
        </div>
      </body>
    </html>
  </xsl:template>

</xsl:stylesheet>
