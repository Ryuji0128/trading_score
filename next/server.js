import express from "express";
import next from "next";
import path from "path";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = express();

    // ✅ 静的ファイルの提供
    server.use("/uploads", express.static(path.join(process.cwd(), "public/uploads")));

    // ✅ Express v5では "*" の代わりに /.*/ を使う
    server.all(/.*/, (req, res) => {
        return handle(req, res);
    });

    const port = process.env.PORT || 3000;
    server.listen(port, "0.0.0.0", () => {
        console.log(`🚀 Server ready on http://0.0.0.0:${port}`);
    });
});
